/**
 * One definition of "open", "needs attention" and money totals for bookings.
 *
 * The Overview, the Bookings page and the action queue all use these
 * functions, so their numbers always agree. Previously each page had its
 * own rules (e.g. Overview counted archived and cancelled bookings), which
 * made the same figure differ from page to page.
 */

/** The fields these rules need — satisfied by TravelRequestRecord. */
export type BookingLike = {
  status: string;
  archivedAt: string | null;
  tripDate: string | null;
  assignedTo: string | null;
  followUpAt: string | null;
  paymentDueAt: string | null;
  quotedAmount: number | null;
  amountPaid: number;
  quoteCurrency: string | null;
  createdAt: string;
};

/** Statuses where no more work is expected. */
const CLOSED_STATUSES = new Set([
  "cancelled",
  "canceled",
  "rejected",
  "completed",
  "closed",
  "archived",
]);

/** Statuses for a request nobody has responded to yet. */
const NEW_STATUSES = new Set(["new", "pending", "pending-review", "submitted", "request_received"]);

/** A response is expected within this window (matches the public "48 hours" promise). */
export const RESPONSE_WINDOW_MS = 48 * 60 * 60 * 1000;

/** Today's date in Ghana as YYYY-MM-DD, for comparing with trip dates. */
export function todayInAccra(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Accra",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function isArchived(b: BookingLike) {
  return Boolean(b.archivedAt);
}

export function isClosed(b: BookingLike) {
  return isArchived(b) || CLOSED_STATUSES.has((b.status ?? "").toLowerCase());
}

export function isNew(b: BookingLike) {
  return NEW_STATUSES.has((b.status ?? "").toLowerCase());
}

/** The trip date has passed. */
export function isPastTrip(b: BookingLike, today: string) {
  return Boolean(b.tripDate && b.tripDate.slice(0, 10) < today);
}

/** Still being worked on: not archived, not closed, and the trip hasn't happened yet. */
export function isOpen(b: BookingLike, today: string) {
  return !isClosed(b) && !isPastTrip(b, today);
}

/**
 * Not closed, but the trip date has passed — usually a booking someone
 * forgot to mark completed or cancelled. Shown as a clean-up prompt rather
 * than as urgent work.
 */
export function isStalePastTrip(b: BookingLike, today: string) {
  return !isClosed(b) && isPastTrip(b, today);
}

export function totalDue(b: BookingLike) {
  return Number(b.quotedAmount ?? 0);
}

export function balanceDue(b: BookingLike) {
  return Math.max(totalDue(b) - Number(b.amountPaid ?? 0), 0);
}

export function isGhs(b: BookingLike) {
  return !b.quoteCurrency || b.quoteCurrency === "GHS";
}

export type AttentionReason = "unassigned" | "no-response" | "follow-up-overdue" | "payment-overdue";

/** Why an open booking needs a team action right now (empty = nothing to do). */
export function attentionReasons(b: BookingLike, now: Date = new Date()): AttentionReason[] {
  const today = todayInAccra(now);
  if (!isOpen(b, today)) return [];

  const reasons: AttentionReason[] = [];
  const nowMs = now.getTime();
  const ageMs = nowMs - new Date(b.createdAt).getTime();

  if (!b.assignedTo) reasons.push("unassigned");
  else if (isNew(b) && ageMs > RESPONSE_WINDOW_MS) reasons.push("no-response");

  if (b.followUpAt && new Date(b.followUpAt).getTime() < nowMs) reasons.push("follow-up-overdue");

  if (b.paymentDueAt && b.paymentDueAt.slice(0, 10) < today && balanceDue(b) > 0) {
    reasons.push("payment-overdue");
  }

  return reasons;
}

export function needsAttention(b: BookingLike, now: Date = new Date()) {
  return attentionReasons(b, now).length > 0;
}

/** Headline numbers shared by the Overview and the Bookings page. */
export function bookingTotals(bookings: BookingLike[], now: Date = new Date()) {
  const today = todayInAccra(now);
  const notArchived = bookings.filter((b) => !isArchived(b));

  return {
    /** Bookings not archived (what "All bookings" lists by default). */
    active: notArchived.length,
    /** Open bookings with at least one attention reason. */
    needsAttention: bookings.filter((b) => needsAttention(b, now)).length,
    /** Open bookings whose trip is still ahead. */
    open: bookings.filter((b) => isOpen(b, today)).length,
    /** Not closed but the trip date has passed — need tidying up. */
    stalePastTrips: bookings.filter((b) => isStalePastTrip(b, today)).length,
    /** GHS received on bookings that aren't archived (including later-cancelled ones that paid). */
    receivedGhs: notArchived.filter(isGhs).reduce((sum, b) => sum + Number(b.amountPaid ?? 0), 0),
    /** GHS still owed on open bookings only. */
    outstandingGhs: bookings
      .filter((b) => isOpen(b, today) && isGhs(b))
      .reduce((sum, b) => sum + balanceDue(b), 0),
  };
}

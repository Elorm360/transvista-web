const TRAVELER_INTENTS = new Set(["Traveler", "Student"]);

export function isPartnerInterest(interest: string) {
  return Boolean(interest) && !TRAVELER_INTENTS.has(interest);
}

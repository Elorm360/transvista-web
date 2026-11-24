/**
 * Server-action results that keep their error message.
 *
 * In production, Next.js replaces the message of any error *thrown* from a
 * server action with a generic one, so staff saw "An error occurred" instead
 * of e.g. "You cannot change your own team role". Returning the message as
 * data avoids that.
 *
 * Server: `return toActionResult(() => doWork(input))`
 * Client: `unwrapActionResult(await action(input))` (throws locally, so
 * existing try/catch blocks keep working and now show the real message).
 */

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function toActionResult<T>(work: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await work() };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error && error.message ? error.message : "Something went wrong. Please try again.",
    };
  }
}

export function unwrapActionResult<T>(result: ActionResult<T>): T {
  if (!result.ok) throw new Error(result.error);
  return result.data;
}

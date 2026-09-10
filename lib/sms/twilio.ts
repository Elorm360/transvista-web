import "server-only";

const MAX_SMS_LENGTH = 320;

export type SmsDeliveryResult = {
  providerMessageId: string;
  status: string;
};

export function isSmsConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_MESSAGING_SERVICE_SID,
  );
}

export function normalizeSmsPhone(value: string) {
  let phone = value.trim().replace(/[\s()-]/g, "");
  if (phone.startsWith("00")) phone = `+${phone.slice(2)}`;
  if (phone.startsWith("0")) phone = `+233${phone.slice(1)}`;
  if (!phone.startsWith("+") && /^\d{9}$/.test(phone)) {
    phone = `+233${phone}`;
  }
  return /^\+[1-9]\d{7,14}$/.test(phone) ? phone : null;
}

export async function sendTransactionalSms(input: {
  to: string;
  body: string;
}): Promise<SmsDeliveryResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const to = normalizeSmsPhone(input.to);
  const body = input.body.trim();

  if (!accountSid || !authToken || !messagingServiceSid) {
    throw new Error("SMS_NOT_CONFIGURED");
  }
  if (!to) throw new Error("SMS_INVALID_PHONE");
  if (!body || body.length > MAX_SMS_LENGTH) {
    throw new Error("SMS_INVALID_BODY");
  }

  const payload = new URLSearchParams({
    To: to,
    Body: body,
    MessagingServiceSid: messagingServiceSid,
  });
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload,
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    },
  );

  const result = (await response.json().catch(() => null)) as
    | { sid?: string; status?: string; message?: string }
    | null;

  if (!response.ok || !result?.sid) {
    console.error("[sendTransactionalSms] Twilio rejected the message", {
      status: response.status,
      providerMessage: result?.message,
    });
    throw new Error("SMS_PROVIDER_REJECTED");
  }

  return {
    providerMessageId: result.sid,
    status: result.status ?? "queued",
  };
}

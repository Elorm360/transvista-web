"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, Star, X } from "lucide-react";
import { submitReview } from "@/app/actions/reviews";
import { ADINKRA_AVATARS, AdinkraAvatar, type AdinkraId } from "@/components/reviews/AdinkraAvatars";

const fieldClass =
  "mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-200";
const labelClass = "block text-sm font-semibold text-slate-800";
const MAX_ORIGINAL_BYTES = 5 * 1024 * 1024;

/**
 * Shrink and square-crop a photo in the browser before upload.
 * Re-drawing on a canvas also drops hidden metadata such as GPS location;
 * the server re-processes it again for safety.
 */
async function prepareSquareJpeg(file: File, size = 800): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = Math.max(0, (bitmap.height - side) / 2 - side * 0.08); // favour faces slightly above centre
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no-canvas");
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) throw new Error("no-blob");
  return blob;
}

type PictureMode = "photo" | "avatar" | "none";

export function ReviewForm() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [mode, setMode] = useState<PictureMode>("none");
  const [avatar, setAvatar] = useState<AdinkraId | null>(null);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<null | { published: boolean; photoPending: boolean }>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  async function onPickPhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please choose a photo (JPG or PNG).");
      return;
    }
    if (file.size > MAX_ORIGINAL_BYTES) {
      setError("That photo is larger than 5 MB. Please choose a smaller one.");
      return;
    }
    setPreparing(true);
    try {
      const blob = await prepareSquareJpeg(file);
      setPhotoBlob(blob);
      setPhotoPreview(URL.createObjectURL(blob));
      setMode("photo");
      setAvatar(null);
    } catch {
      setError("We couldn't read that photo. Please try a JPG or PNG, or choose an avatar.");
    } finally {
      setPreparing(false);
    }
  }

  function clearPhoto() {
    setPhotoBlob(null);
    setPhotoPreview(null);
    setMode("none");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!rating) {
      setError("Please choose a star rating.");
      return;
    }
    const form = new FormData(event.currentTarget);
    form.set("rating", String(rating));
    form.delete("photo");
    form.delete("avatar");
    if (mode === "photo" && photoBlob) form.set("photo", photoBlob, "photo.jpg");
    if (mode === "avatar" && avatar) form.set("avatar", avatar);

    setSubmitting(true);
    try {
      const result = await submitReview(form);
      if (result.success) {
        setDone({ published: Boolean(result.published), photoPending: Boolean(result.photoPending) });
      } else {
        setError(result.message || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center" role="status">
        <CheckCircle2 aria-hidden="true" className="mx-auto h-12 w-12 text-emerald-600" />
        <h3 className="font-display mt-4 text-2xl font-semibold text-slate-900">Thank you for sharing!</h3>
        <p className="mx-auto mt-2 max-w-md text-slate-600">
          {done.published
            ? "Your trip was verified and your review is now live on our website. Medaase!"
            : "Your review has been received. Our team will check it shortly before it appears on the website."}
        </p>
        {done.photoPending && (
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Your photo will appear once our team has approved it.
          </p>
        )}
      </div>
    );
  }

  const tabClass = (active: boolean) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-brand-blue-800 text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Honeypot for bots — hidden from people */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <fieldset>
        <legend className={labelClass}>Your rating *</legend>
        <div className="mt-2 flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              className="rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange-500"
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              aria-pressed={rating === n}
            >
              <Star
                aria-hidden="true"
                className={`h-8 w-8 transition ${n <= (hover || rating) ? "fill-brand-orange-500 text-brand-orange-500" : "text-slate-300"}`}
              />
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Your name *
          <input name="fullName" required maxLength={80} autoComplete="name" className={fieldClass} />
        </label>
        <label className={labelClass}>
          Where are you from?
          <input name="location" maxLength={80} placeholder="e.g. Accra, Ghana" className={fieldClass} />
        </label>
      </div>

      {/* Picture: photo, Adinkra avatar, or initials */}
      <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
        <legend className="px-1 text-sm font-semibold text-slate-800">Your picture (optional)</legend>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={tabClass(mode === "photo")} onClick={() => fileInput.current?.click()} disabled={preparing}>
            <Camera aria-hidden="true" className="mr-1.5 inline h-4 w-4 align-[-2px]" />
            {preparing ? "Preparing photo…" : photoPreview ? "Change photo" : "Upload my photo"}
          </button>
          <button type="button" className={tabClass(mode === "avatar")} onClick={() => setMode("avatar")}>
            Choose an avatar
          </button>
          {mode !== "none" && (
            <button type="button" className={tabClass(false)} onClick={() => { clearPhoto(); setAvatar(null); }}>
              No picture
            </button>
          )}
        </div>
        <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onPickPhoto} />

        {mode === "photo" && photoPreview && (
          <div className="mt-4 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- local preview of the visitor's own file */}
            <img src={photoPreview} alt="Your photo preview" className="h-20 w-20 rounded-full object-cover ring-2 ring-brand-orange-500 ring-offset-2" />
            <div className="text-sm text-slate-600">
              <p>This is how your photo will look.</p>
              <button type="button" onClick={clearPhoto} className="mt-1 inline-flex items-center gap-1 font-semibold text-slate-700 hover:underline">
                <X aria-hidden="true" className="h-4 w-4" /> Remove
              </button>
            </div>
          </div>
        )}
        {mode === "photo" && photoPreview && (
          <label className="mt-4 flex items-start gap-3 text-sm text-slate-700">
            <input name="photoConsent" type="checkbox" required className="mt-1 h-4 w-4 accent-[#F47B20]" />
            <span>This is a photo of me, and I&apos;m happy for it to appear on the TransVista website. Photos are checked by our team before they appear.</span>
          </label>
        )}

        {mode === "avatar" && (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6" role="radiogroup" aria-label="Choose an Adinkra avatar">
            {ADINKRA_AVATARS.map((a) => (
              <button
                key={a.id}
                type="button"
                role="radio"
                aria-checked={avatar === a.id}
                onClick={() => setAvatar(a.id)}
                className={`flex flex-col items-center gap-1.5 rounded-xl p-2 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange-500 ${avatar === a.id ? "bg-white shadow-md ring-2 ring-brand-orange-500" : "hover:bg-white"}`}
              >
                <AdinkraAvatar id={a.id} size={52} />
                <span className="text-[11px] font-semibold leading-tight text-slate-800">{a.name}</span>
                <span className="text-[10px] leading-tight text-slate-500">{a.meaning}</span>
              </button>
            ))}
          </div>
        )}
        {mode === "none" && (
          <p className="mt-3 text-xs text-slate-500">If you skip this, we&apos;ll show your initials.</p>
        )}
      </fieldset>

      <label className={labelClass}>
        Which trip did you join? *
        <input name="tripName" maxLength={120} placeholder="e.g. Central Region Day Trip" className={fieldClass} />
      </label>

      <label className={labelClass}>
        Your review *
        <textarea
          name="review"
          required
          minLength={20}
          maxLength={1200}
          rows={5}
          placeholder="What did you enjoy most? What stood out about travelling with TransVista?"
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-200"
        />
      </label>

      <div className="rounded-2xl border border-brand-blue-100 bg-brand-blue-50/60 p-5">
        <p className="text-sm font-semibold text-slate-900">Get a ✓ Verified traveller badge (optional)</p>
        <p className="mt-1 text-sm text-slate-600">
          Add your booking reference and the email you booked with. Verified reviews appear on the website straight away.
          Your email and reference are never shown publicly.
        </p>
        <div className="mt-3 grid gap-5 sm:grid-cols-2">
          <label className={labelClass}>
            Booking reference
            <input name="bookingReference" maxLength={40} placeholder="e.g. TVP-2026-XXXXXXXX" className={`${fieldClass} uppercase placeholder:normal-case`} />
          </label>
          <label className={labelClass}>
            Email you booked with
            <input name="email" type="email" maxLength={254} autoComplete="email" className={fieldClass} />
          </label>
        </div>
      </div>

      <label className="flex items-start gap-3 text-sm text-slate-700">
        <input name="consent" type="checkbox" required className="mt-1 h-4 w-4 accent-[#F47B20]" />
        <span>I agree that TransVista Africa may show my name, rating and review on its website.</span>
      </label>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || preparing}
        className="inline-flex h-12 items-center justify-center rounded-full bg-brand-orange-600 px-8 text-base font-semibold text-white shadow-lg transition hover:bg-brand-orange-700 disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Share my review"}
      </button>
    </form>
  );
}

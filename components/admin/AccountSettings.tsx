"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, KeyRound, Trash2, UserRound } from "lucide-react";
import { Avatar } from "@/components/admin/Avatar";
import AppearanceSettings from "@/components/admin/AppearanceSettings";
import { buttonClass, Card } from "@/components/admin/ui";
import { changeMyPassword, removeMyAvatar, updateMyProfile, uploadMyAvatar } from "@/app/actions/account";
import { unwrapActionResult } from "@/lib/actions/result";
import type { MyProfile } from "@/lib/dashboard/getMyProfile";

const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100 disabled:bg-slate-50 disabled:text-slate-500";

type Feedback = { kind: "success" | "error"; text: string } | null;

function Message({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  return (
    <p
      role={feedback.kind === "error" ? "alert" : "status"}
      className={`rounded-lg px-3 py-2 text-sm ${feedback.kind === "error" ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}
    >
      {feedback.text}
    </p>
  );
}

/** Shrink a photo in the browser to a 256×256 WebP before upload. */
async function resizeToSquare(file: File, size = 256): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser couldn't process this photo.");
  // Centre-crop to a square, then scale.
  context.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
  if (!blob) throw new Error("Your browser couldn't process this photo.");
  return blob;
}

const roleLabels: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  support: "Support",
  community_manager: "Community Manager",
};

export default function AccountSettings({ profile }: { profile: MyProfile }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<Feedback>(null);

  const [avatarPath, setAvatarPath] = useState(profile.avatarPath);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoFeedback, setPhotoFeedback] = useState<Feedback>(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback>(null);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileFeedback(null);
    try {
      unwrapActionResult(await updateMyProfile({ fullName, phone }));
      setProfileFeedback({ kind: "success", text: "Profile saved." });
      router.refresh();
    } catch (error) {
      setProfileFeedback({ kind: "error", text: error instanceof Error ? error.message : "Your profile could not be saved." });
    } finally {
      setSavingProfile(false);
    }
  }

  async function choosePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoFeedback({ kind: "error", text: "Choose an image file (JPG, PNG or WebP)." });
      return;
    }
    setPhotoBusy(true);
    setPhotoFeedback(null);
    try {
      const resized = await resizeToSquare(file);
      const localUrl = URL.createObjectURL(resized);
      setPreview(localUrl);
      const data = new FormData();
      data.set("avatar", new File([resized], "avatar.webp", { type: "image/webp" }));
      const result = unwrapActionResult(await uploadMyAvatar(data));
      setAvatarPath(result.avatarPath);
      setPhotoFeedback({ kind: "success", text: "Photo updated." });
      router.refresh();
    } catch (error) {
      setPreview(null);
      setPhotoFeedback({ kind: "error", text: error instanceof Error ? error.message : "The photo could not be uploaded." });
    } finally {
      setPhotoBusy(false);
    }
  }

  async function deletePhoto() {
    setPhotoBusy(true);
    setPhotoFeedback(null);
    try {
      unwrapActionResult(await removeMyAvatar());
      setAvatarPath(null);
      setPreview(null);
      setPhotoFeedback({ kind: "success", text: "Photo removed." });
      router.refresh();
    } catch (error) {
      setPhotoFeedback({ kind: "error", text: error instanceof Error ? error.message : "The photo could not be removed." });
    } finally {
      setPhotoBusy(false);
    }
  }

  async function savePassword(event: React.FormEvent) {
    event.preventDefault();
    setSavingPassword(true);
    setPasswordFeedback(null);
    try {
      unwrapActionResult(await changeMyPassword({ password, confirm }));
      setPassword("");
      setConfirm("");
      setPasswordFeedback({ kind: "success", text: "Password changed. Use it next time you sign in." });
    } catch (error) {
      setPasswordFeedback({ kind: "error", text: error instanceof Error ? error.message : "Your password could not be changed." });
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card title="Photo" description="Shown to your team in the admin." className="lg:col-span-1" bodyClassName="p-5">
        <div className="flex flex-col items-center gap-4 text-center">
          <Avatar name={fullName || profile.fullName} path={avatarPath} src={preview} size="lg" />
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={photoBusy} className={buttonClass("secondary")}>
              <Camera className="h-4 w-4" aria-hidden="true" /> {photoBusy ? "Saving…" : avatarPath ? "Change photo" : "Add photo"}
            </button>
            {avatarPath && (
              <button type="button" onClick={deletePhoto} disabled={photoBusy} className={buttonClass("ghost", "text-red-700 hover:bg-red-50")}>
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={choosePhoto} aria-label="Upload a profile photo" />
          <p className="text-xs text-slate-500">A square photo of your face works best. It&apos;s cropped and resized automatically.</p>
          <Message feedback={photoFeedback} />
        </div>
      </Card>

      <div className="space-y-6 lg:col-span-2">
        <Card title={<span className="flex items-center gap-2"><UserRound className="h-4 w-4 text-slate-400" aria-hidden="true" />Profile</span>} bodyClassName="p-5">
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Full name</span>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={2} maxLength={120} autoComplete="name" className={inputClass} />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Phone <span className="font-normal text-slate-400">(optional)</span></span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={32} type="tel" autoComplete="tel" placeholder="+233 24 000 0000" className={inputClass} />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
                <input value={profile.email} disabled className={inputClass} />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Role</span>
                <input value={roleLabels[profile.role] ?? profile.role} disabled className={inputClass} />
              </label>
            </div>
            <p className="text-xs text-slate-500">Your email and role are managed by the owner.</p>
            <Message feedback={profileFeedback} />
            <button type="submit" disabled={savingProfile} className={buttonClass("primary")}>
              {savingProfile ? "Saving…" : "Save profile"}
            </button>
          </form>
        </Card>

        <AppearanceSettings initialTheme={profile.theme} />

        <Card title={<span className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-slate-400" aria-hidden="true" />Password</span>} bodyClassName="p-5">
          <form onSubmit={savePassword} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">New password</span>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Confirm new password</span>
                <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
              </label>
            </div>
            <p className="text-xs text-slate-500">At least 8 characters. Don&apos;t reuse a password from another site.</p>
            <Message feedback={passwordFeedback} />
            <button type="submit" disabled={savingPassword} className={buttonClass("primary")}>
              {savingPassword ? "Saving…" : "Change password"}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}

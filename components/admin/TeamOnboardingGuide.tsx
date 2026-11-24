import { BookOpen, ShieldCheck, UserPlus, MailCheck, Compass } from "lucide-react";
import type { CustomRole } from "@/lib/dashboard/getRoles";
import { effectiveAreas, GRANTABLE_AREAS } from "@/lib/auth/permissions";

const steps = [
  { icon: UserPlus, title: "1. Invite", text: "Add team member → enter their name and work email → pick their role. The form shows exactly what they'll be able to open." },
  { icon: MailCheck, title: "2. They accept", text: "They open the TransVista email, follow the secure link and choose their own password. Nobody else ever knows it." },
  { icon: Compass, title: "3. First sign-in", text: "Their Overview shows a welcome card with only their sections, plus links to add a photo and turn on two-step sign-in." },
  { icon: ShieldCheck, title: "4. Review", text: "Check the Audit log after their first week. When someone leaves, use Remove access: their history is kept." },
];

/** Settings guide for onboarding team leads, built from the live role list. */
export default function TeamOnboardingGuide({ roles }: { roles: CustomRole[] }) {
  const label = (area: string) => GRANTABLE_AREAS.find((item) => item.area === area)?.label ?? area;

  return (
    <section className="rounded-xl border border-brand-blue-100 bg-white p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-brand-blue-50 p-2.5"><BookOpen className="h-5 w-5 text-brand-blue-700" /></div>
        <div>
          <h2 className="font-bold text-slate-950">Onboarding your team</h2>
          <p className="mt-1 text-sm text-slate-600">Four steps to bring a team lead in with exactly the access their job needs.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-xl bg-slate-50 p-4">
            <Icon className="h-5 w-5 text-slate-600" />
            <h3 className="mt-3 text-sm font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-bold text-slate-900">Who sees what</h3>
        <div className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200">
          <div className="grid gap-1 px-4 py-3 sm:grid-cols-[240px_1fr]">
            <p className="text-sm font-semibold text-slate-900">Super Admin <span className="font-normal text-slate-500">(Founder &amp; CEO)</span></p>
            <p className="text-sm leading-6 text-slate-600">Everything, including team and role settings, the audit log and all financial information.</p>
          </div>
          {roles.map((role) => {
            const areas = effectiveAreas(role.baseRole, role.permissions).filter((area) => area !== "dashboard");
            return (
              <div key={role.key} className="grid gap-1 px-4 py-3 sm:grid-cols-[240px_1fr]">
                <p className="text-sm font-semibold text-slate-900">{role.name}</p>
                <div>
                  {role.description && <p className="text-sm leading-6 text-slate-600">{role.description}</p>}
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {areas.map((area) => <span key={area} className="rounded-full bg-brand-blue-50 px-2 py-0.5 text-xs font-medium text-brand-blue-800">{label(area)}</span>)}
                    {!areas.includes("payments") && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">No money figures</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        Every payment, correction, role change and team change is recorded in the Audit log, which only the Super Admin can see. Change what a role can open under Roles above.
      </p>
    </section>
  );
}

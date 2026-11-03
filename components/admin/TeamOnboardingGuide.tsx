import { BookOpen, ShieldCheck, UserPlus, MailCheck } from "lucide-react";

const roles=[
 {name:"Owner",access:"Full access, including team settings and access management."},
 {name:"Admin",access:"Bookings, payments, community, analytics and daily operations. Can correct payment totals, but cannot manage team access."},
 {name:"Support",access:"Booking requests, traveller follow-ups and messages. Can record verified payments and view receipts, but cannot correct totals or change team access."},
 {name:"Community Manager",access:"Community members and the main dashboard. No booking or payment management."},
];

export default function TeamOnboardingGuide(){
 return <section className="rounded-2xl border border-blue-100 bg-white p-6">
  <div className="flex items-start gap-3"><div className="rounded-xl bg-blue-50 p-2.5"><BookOpen className="h-5 w-5 text-blue-700"/></div><div><h2 className="font-bold text-slate-950">Getting a new team member started</h2><p className="mt-1 text-sm text-slate-600">A simple, secure process for adding colleagues to the TransVista workspace.</p></div></div>
  <div className="mt-5 grid gap-4 md:grid-cols-3">
   <div className="rounded-xl bg-slate-50 p-4"><UserPlus className="h-5 w-5 text-slate-600"/><h3 className="mt-3 text-sm font-bold text-slate-900">1. Invite the person</h3><p className="mt-1 text-sm leading-6 text-slate-600">Choose Add Team Member, enter their work name and email, then select the role that matches their responsibilities.</p></div>
   <div className="rounded-xl bg-slate-50 p-4"><MailCheck className="h-5 w-5 text-slate-600"/><h3 className="mt-3 text-sm font-bold text-slate-900">2. They set up access</h3><p className="mt-1 text-sm leading-6 text-slate-600">They open the TransVista invitation email, follow the secure link and set their own password. They should never share passwords.</p></div>
   <div className="rounded-xl bg-slate-50 p-4"><ShieldCheck className="h-5 w-5 text-slate-600"/><h3 className="mt-3 text-sm font-bold text-slate-900">3. Review access</h3><p className="mt-1 text-sm leading-6 text-slate-600">Confirm they can see only the areas needed for their work. Deactivate access when someone leaves; their activity history is retained.</p></div>
  </div>
  <div className="mt-5"><h3 className="text-sm font-bold text-slate-900">Role and access guide</h3><div className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200">{roles.map(role=><div key={role.name} className="grid gap-1 px-4 py-3 sm:grid-cols-[170px_1fr]"><p className="text-sm font-semibold text-slate-900">{role.name}</p><p className="text-sm leading-6 text-slate-600">{role.access}</p></div>)}</div></div>
  <p className="mt-4 text-xs leading-5 text-slate-500">Good practice: use each person's own account, grant the least access needed, and review team membership regularly.</p>
 </section>
}

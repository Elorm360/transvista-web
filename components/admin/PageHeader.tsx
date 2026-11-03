import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export default function PageHeader({ icon: Icon, title, description }: PageHeaderProps) {
  return (
    <div className="mb-8 flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 shadow-sm shadow-orange-900/[0.03]">
        <Icon className="h-5 w-5 text-[#c85f16]" />
      </div>
      <div className="min-w-0 pt-0.5">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.17em] text-slate-400">TransVista workspace</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-[28px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}
      </div>
    </div>
  );
}

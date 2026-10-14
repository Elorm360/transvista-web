import { Container } from "@/components/ui/Container";

type PageHeaderProps = {
  eyebrow: React.ReactNode;
  title: string;
  lead?: React.ReactNode;
  children?: React.ReactNode;
};

/** Shared header for inner pages: quiet eyebrow, large display title, lead. */
export function PageHeader({ eyebrow, title, lead, children }: PageHeaderProps) {
  return (
    <header className="border-b border-slate-200/80 bg-[#f7f5f1] pb-12 pt-14 lg:pb-16 lg:pt-20">
      <Container>
        <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-brand-orange-600">
          {eyebrow}
        </div>
        <h1 className="font-display mt-4 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-slate-950 sm:text-6xl">
          {title}
        </h1>
        {lead && (
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{lead}</p>
        )}
        {children}
      </Container>
    </header>
  );
}

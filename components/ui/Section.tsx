import { cn } from "@/lib/utils";

type SectionProps = {
  children: React.ReactNode;
  /** Optional id for scroll/smooth navigation */
  id?: string;
  className?: string;
};

export function Section({
  children,
  id,
  className,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-24 py-20 lg:scroll-mt-28 lg:py-28", className)}
    >
      {children}
    </section>
  );
}

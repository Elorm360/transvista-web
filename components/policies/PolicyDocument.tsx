import { Container } from "@/components/ui/Container";
import type { PolicySection } from "@/content/payment-policy";

type PolicyDocumentProps = {
  title: string;
  effectiveLabel: string;
  introduction: string;
  sections: PolicySection[];
};

export function PolicyDocument({
  title,
  effectiveLabel,
  introduction,
  sections,
}: PolicyDocumentProps) {
  return (
    <main id="main-content" className="bg-[#fffdfa]">
      <header className="border-b border-slate-200 bg-white py-12 lg:py-16">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-orange-700">
            TransVista Africa Ltd
          </p>
          <h1 className="font-display mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-sm font-medium text-slate-500">
            {effectiveLabel}
          </p>
          <p className="mt-6 max-w-3xl text-base leading-7 text-slate-600">
            {introduction}
          </p>
        </Container>
      </header>

      <section className="py-12 lg:py-16">
        <Container>
          <div className="mx-auto max-w-4xl space-y-5">
            {sections.map((section) => (
              <article
                key={section.title}
                id={section.id}
                className="rounded-[24px] border border-slate-200 bg-white p-6 sm:p-8"
              >
                <h2 className="font-display text-xl font-semibold text-slate-900">
                  {section.title}
                </h2>
                {section.paragraphs?.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-4 text-base leading-7 text-slate-600"
                  >
                    {paragraph}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mt-4 space-y-2">
                    {section.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex gap-3 text-base leading-7 text-slate-600"
                      >
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange-500" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}

import { notFound } from "next/navigation";
import { destinations } from "@/constants/data/destinations";

type DestinationPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function DestinationPage({
  params,
}: DestinationPageProps) {
  const { slug } = await params;

  const destination = destinations.find(
    (item) => item.slug === slug,
  );

  if (!destination) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#fffdfa]">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
            {destination.region}
          </p>

          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            {destination.name}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            {destination.description}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-100 via-white to-amber-50 p-8 text-center">
            <div>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-8 w-8 text-slate-400"
                  aria-hidden="true"
                >
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <circle cx="8.5" cy="9" r="1.5" />
                  <path d="m21 15-4.5-4.5L7 20" />
                </svg>
              </div>

              <p className="mt-4 text-base font-semibold text-slate-700">
                Original photo coming soon
              </p>

              <p className="mt-1 text-sm text-slate-400">
                TransVista destination photography
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
              Explore
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
              Discover {destination.name}
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600">
              More destination information, experiences, trusted transport,
              and travel guidance will be added here as TransVista's Travel
              Discovery platform develops.
            </p>

            <div className="mt-6 inline-flex w-fit rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              {destination.category}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

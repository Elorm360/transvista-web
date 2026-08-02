import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* ── Skip to main content ── */}
      <a
        href="#main-content"
        className="
            sr-only
            focus:not-sr-only
            focus:absolute
            focus:left-4
            focus:top-4
            focus:z-50
            rounded-full
            bg-white
            px-4
            py-2
            text-sm
            font-medium
            text-slate-900
            shadow-lg
          "
      >
        Skip to main content
      </a>

      <Navbar />

      {children}

      <Footer />
    </>
  );
}

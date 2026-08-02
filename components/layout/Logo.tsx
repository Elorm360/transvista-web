import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
      aria-label="TransVista Africa Home"
    >
      <Image
        src="/images/TransVista logo.jpeg"
        alt="TransVista Africa"
        width={180}
        height={60}
        sizes="180px"
      />
    </Link>
  );
}
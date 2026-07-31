import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center"
      aria-label="TransVista Africa Home"
    >
      <Image
        src="/images/TransVista logo.jpeg"
        alt="TransVista Africa"
        width={180}
        height={60}
        priority
      />
    </Link>
  );
}
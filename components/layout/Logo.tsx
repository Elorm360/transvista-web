import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  imageClassName?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

const DEFAULT_IMAGE_CLASS =
  "h-[36px] w-auto md:h-[42px] lg:h-[48px]";

export function Logo({
  className = "",
  imageClassName = "",
  width = 48,
  height = 48,
  priority = false,
}: LogoProps) {
  return (
    <Link
      href="/"
      className={`flex items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 ${className}`.trim()}
      aria-label="TransVista Africa Home"
    >
      <Image
        src="/images/hero/transvista-logo.png"
        alt="TransVista Africa"
        width={width}
        height={height}
        priority={priority}
        sizes="(max-width: 768px) 36px, (max-width: 1024px) 42px, 48px"
        className={`h-auto w-auto object-contain ${imageClassName || DEFAULT_IMAGE_CLASS}`.trim()}
      />
    </Link>
  );
}

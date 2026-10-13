import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  imageClassName?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

// Wide, tightly-cropped wordmark so the logo stays legible on small screens.
const DEFAULT_IMAGE_CLASS = "h-10 w-auto lg:h-12";

export function Logo({
  className = "",
  imageClassName = "",
  width = 400,
  height = 164,
  priority = false,
}: LogoProps) {
  return (
    <Link
      href="/"
      className={`flex items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-blue-600 ${className}`.trim()}
      aria-label="TransVista Africa Home"
    >
      <Image
        src="/images/brand/transvista-logo-wide.png"
        alt="TransVista Africa"
        width={width}
        height={height}
        priority={priority}
        sizes="(max-width: 1024px) 100px, 120px"
        className={`h-auto w-auto object-contain ${imageClassName || DEFAULT_IMAGE_CLASS}`.trim()}
      />
    </Link>
  );
}

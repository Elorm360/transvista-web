import { FaWhatsapp } from "react-icons/fa";

/**
 * WhatsAppButton
 *
 * Fixed floating chat entry point — the fastest path from "interested"
 * to "talking to a human," which matters most for a pre-launch platform
 * still building trust. Deep-links straight into a WhatsApp chat.
 */
export function WhatsAppButton() {
  const phone = "233248442916"; // +233 24 844 2916, international format
  const message = encodeURIComponent(
    "Hi TransVista Africa, I would like help planning my trip.",
  );

  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with TransVista Africa on WhatsApp"
      className="pulse-whatsapp group fixed bottom-6 right-6 z-50 flex h-14 items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-4 text-white shadow-[0_12px_30px_-10px_rgba(37,211,102,0.7)] transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366] sm:bottom-8 sm:right-8 sm:px-5"
    >
      <FaWhatsapp className="h-7 w-7 shrink-0" aria-hidden="true" />
      <span className="hidden text-sm font-semibold sm:inline">
        WhatsApp support
      </span>
    </a>
  );
}

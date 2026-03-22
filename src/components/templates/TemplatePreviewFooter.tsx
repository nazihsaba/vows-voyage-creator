import { Instagram, MessageCircle } from "lucide-react";
import aureaLogo from "@/assets/aureaLogoFullColored.png";

const TemplatePreviewFooter = () => {
  return (
    <footer className="py-10 px-4 border-t border-border/40 bg-white/80 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
        <img src={aureaLogo} alt="Aurea Invites" className="h-10 object-contain" />
        <p className="text-sm text-muted-foreground font-medium tracking-wide">Follow us</p>
        <div className="flex items-center gap-6">
          <a
            href="https://www.instagram.com/aureainvites?igsh=MXJjYmJrejF3ejI3eQ=="
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Instagram"
          >
            <Instagram size={22} />
          </a>
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="TikTok"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
            </svg>
          </a>
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="WhatsApp"
          >
            <MessageCircle size={22} />
          </a>
        </div>
        <p className="text-xs text-muted-foreground/60 mt-2">
          © {new Date().getFullYear()} Vows Voyage. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default TemplatePreviewFooter;

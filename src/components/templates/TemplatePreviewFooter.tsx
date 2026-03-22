import aureaLogo from "@/assets/aureaLogoFullColored.png";
import { Instagram } from "lucide-react";

const TemplatePreviewFooter = () => {
  return (
    <footer className="py-8 px-4 bg-white">
      <div className="flex flex-col items-center justify-center gap-2">
        <span className="text-muted-foreground text-sm font-medium tracking-wide">Made for love, by</span>
        <a href="https://aureainvites.com" target="_blank" rel="noopener noreferrer">
          <img src={aureaLogo} alt="Auréa Invites" className="h-7 object-contain" />
        </a>
        <a
          href="https://www.instagram.com/aureainvites?igsh=MXJjYmJrejF3ejI3eQ=="
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Instagram className="h-5 w-5" />
        </a>
      </div>
    </footer>
  );
};

export default TemplatePreviewFooter;

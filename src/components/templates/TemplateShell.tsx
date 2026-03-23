import { ReactNode } from "react";

interface TemplateShellProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps every template/preview so that on desktop (md+) the invitation
 * is displayed at a mobile-like width, centred with a subtle shadow,
 * while on actual mobile it remains full-width.
 */
const TemplateShell = ({ children, className = "" }: TemplateShellProps) => (
  <div className="min-h-screen bg-muted/30 md:flex md:justify-center">
    <div
      className={`w-full md:max-w-[430px] md:shadow-2xl md:border-x md:border-border/40 relative ${className}`}
    >
      {children}
    </div>
  </div>
);

export default TemplateShell;

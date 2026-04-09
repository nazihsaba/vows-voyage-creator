import { AnimatedSection } from "@/hooks/useScrollAnimation";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";

interface FooterSectionProps {
  closingMessage?: string;
  className?: string;
  textClassName?: string;
  showBranding?: boolean;
}

const FooterSection = ({
  closingMessage = "We are so excited to share this special day with you! Please enjoy every moment, take lots of pictures, and make wonderful memories with us.",
  className = "py-16 px-4 text-center",
  textClassName = "",
  showBranding = true,
}: FooterSectionProps) => {
  return (
    <>
      <AnimatedSection animation="fade-in">
        <section className={className}>
          <div className="max-w-3xl mx-auto space-y-8">
            <p className={`text-template-body ${textClassName}`}>{closingMessage}</p>
          </div>
        </section>
      </AnimatedSection>
      {showBranding && <TemplatePreviewFooter />}
    </>
  );
};

export default FooterSection;

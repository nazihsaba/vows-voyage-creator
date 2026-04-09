import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { GiftCards } from "@/components/GiftCards";

interface GiftCardsSectionProps {
  giftCards: any[];
  isOwner?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
}

const GiftCardsSection = ({
  giftCards,
  isOwner = false,
  title = "Wedding Gift",
  subtitle = "For those who desire a wedding list is available",
  className = "py-16 px-4 bg-[#faf8f5]",
  titleClassName = "text-primary",
}: GiftCardsSectionProps) => {
  if (!giftCards || giftCards.length === 0) return null;

  return (
    <AnimatedSection animation="fade-up">
      <section className={className}>
        <div className="max-w-4xl mx-auto">
          <h2 className={`text-template-subtitle text-center mb-12 ${titleClassName}`}>{title}</h2>
          <p className="text-center text-template-body mb-8 text-gray-600">{subtitle}</p>
          <GiftCards giftCards={giftCards} isOwner={isOwner} />
        </div>
      </section>
    </AnimatedSection>
  );
};

export default GiftCardsSection;

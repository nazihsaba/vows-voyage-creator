import { Copy } from "lucide-react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { toast } from "sonner";
import LumiereTornCard, { TornCardVariant } from "./LumiereTornCard";

interface GiftCard {
  id: string;
  card_name: string;
  card_number: string;
  logo_url?: string | null;
}

interface LumiereGiftsProps {
  giftCards: GiftCard[];
  title?: string;
  subtitle?: string;
  cardVariant?: TornCardVariant;
}

const LumiereGifts = ({ giftCards, title = "Wedding Gift", subtitle = "For those who desire, a gift list is available", cardVariant = "solid" }: LumiereGiftsProps) => {
  if (!giftCards || giftCards.length === 0) return null;
  const isGlass = cardVariant === "glass";
  const textColor = isGlass ? "text-white" : "text-black";
  const mutedColor = isGlass ? "text-white/60" : "text-muted-foreground";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <LumiereTornCard variant={cardVariant}>
      <div className="py-14 px-6">
        <AnimatedSection animation="fade-in">
          <h2 className={`text-template-subtitle text-center ${textColor} mb-3`}>{title}</h2>
          <p className={`text-center text-template-body ${mutedColor} mb-10`}>{subtitle}</p>
        </AnimatedSection>
        <div className="grid gap-4 md:grid-cols-2 max-w-xl mx-auto">
          {giftCards.map((card, index) => (
            <AnimatedSection key={card.id} delay={index * 100} animation="scale-in">
              <div
                className={`p-5 rounded-lg text-center cursor-pointer transition-colors ${
                  isGlass
                    ? "bg-white/10 hover:bg-white/20"
                    : "bg-muted hover:bg-muted/80"
                }`}
                onClick={() => copyToClipboard(card.card_number)}
              >
                <p className={`font-semibold ${isGlass ? "text-white" : "text-foreground"}`}>{card.card_name}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <p className={`text-sm ${mutedColor}`}>{card.card_number}</p>
                  <Copy className={`w-3.5 h-3.5 ${mutedColor}`} />
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </LumiereTornCard>
  );
};

export default LumiereGifts;

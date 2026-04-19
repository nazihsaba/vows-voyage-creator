import { useTranslation } from "react-i18next";
import { Copy } from "lucide-react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { toast } from "sonner";
import LumiereTornCard from "./LumiereTornCard";

interface GiftCard {
  id: string;
  card_name: string;
  card_number: string;
  logo_url?: string | null;
}

interface LumiereGiftsProps {
  giftCards: GiftCard[];
}

const LumiereGifts = ({ giftCards }: LumiereGiftsProps) => {
  const { t } = useTranslation();
  if (!giftCards || giftCards.length === 0) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <LumiereTornCard>
      <div className="py-14 px-6">
        <AnimatedSection animation="fade-in">
          <h2 className="text-template-subtitle text-center text-black mb-3">{t("gifts.title")}</h2>
          <p className="text-center text-template-body text-muted-foreground mb-10">{t("gifts.subtitle")}</p>
        </AnimatedSection>
        <div className={`grid gap-4 mx-auto justify-center ${giftCards.length === 1 ? "grid-cols-1 max-w-xs" : "md:grid-cols-2 max-w-xl"}`}>
          {giftCards.map((card, index) => (
            <AnimatedSection key={card.id} delay={index * 100} animation="scale-in">
              <div
                className="bg-muted p-5 rounded-lg text-center cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => copyToClipboard(card.card_number)}
              >
                <p className="font-semibold text-foreground">{card.card_name}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <p className="text-sm text-muted-foreground">{card.card_number}</p>
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
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

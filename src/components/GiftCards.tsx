import { Copy } from "lucide-react";
import omtLogo from "@/assets/omt-logo.jpg";
import whishLogo from "@/assets/whish-logo.png";
import { useToast } from "@/hooks/use-toast";

interface GiftCard {
  id: string;
  card_name: string;
  card_number: string;
  logo_url?: string;
}

interface GiftCardsProps {
  giftCards: GiftCard[];
  isOwner?: boolean;
}

const getCardLogo = (cardName: string): string | undefined => {
  const normalizedName = cardName.toLowerCase().trim();
  if (normalizedName.includes("omt")) return omtLogo;
  if (normalizedName.includes("whish")) return whishLogo;
  return undefined;
};

export const GiftCards = ({ giftCards, isOwner = false }: GiftCardsProps) => {
  const { toast } = useToast();

  if (!giftCards || giftCards.length === 0) return null;

  const copyToClipboard = (cardNumber: string, cardName: string) => {
    navigator.clipboard.writeText(cardNumber);
    toast({
      title: "Copied!",
      description: `${cardName} number copied to clipboard`,
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {giftCards.map((card) => {
        const logoSrc = card.logo_url || getCardLogo(card.card_name);
        return (
          <div key={card.id} className="bg-[#faf8f5] p-6 rounded-lg text-center space-y-2">
            {logoSrc && (
              <div className="flex justify-center mb-2">
                <img
                  src={logoSrc}
                  alt={card.card_name}
                  className="h-8 w-8 object-contain rounded-[6px]"
                />
              </div>
            )}
            <p className="font-semibold text-lg text-[#3e2723]">{card.card_name}</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-gray-600">{card.card_number}</p>
              <Copy
                className="h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-700 transition-colors"
                onClick={() => copyToClipboard(card.card_number, card.card_name)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
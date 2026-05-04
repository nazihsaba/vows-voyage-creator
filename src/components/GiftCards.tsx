import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GiftCard {
  id: string;
  card_name: string;
  card_number: string;
}

interface GiftCardsProps {
  giftCards: GiftCard[];
  isOwner?: boolean;
}

export const GiftCards = ({ giftCards, isOwner = false }: GiftCardsProps) => {
  const { toast } = useToast();

  if (!giftCards || giftCards.length === 0) return null;

  const copyToClipboard = (cardNumber: string, cardName: string) => {
    navigator.clipboard.writeText(cardNumber);
    toast({
      title: "Copied!",
      description: `${cardName} number copied`,
    });
  };

  return (
    <div className={`grid gap-4 ${giftCards.length === 1 ? "md:grid-cols-1 md:max-w-md md:mx-auto" : "md:grid-cols-2"}`}>
      {giftCards.map((card) => (
        <div key={card.id} className="bg-[#faf8f5] p-6 rounded-lg text-center space-y-2">
          <p className="font-semibold text-lg text-[#3e2723] text-template-body">{card.card_name}</p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-gray-600 text-template-body">{card.card_number}</p>
            <Copy
              className="h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-700 transition-colors"
              onClick={() => copyToClipboard(card.card_number, card.card_name)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

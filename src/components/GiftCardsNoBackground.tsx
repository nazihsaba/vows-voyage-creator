import { Card, CardContent } from "@/components/ui/card";
import { Gift, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GiftCard {
  id: string;
  card_name: string;
  card_number: string;
}

interface GiftCardsNoBackgroundProps {
  giftCards: GiftCard[];
  isOwner?: boolean;
}

export const GiftCardsNoBackground = ({ giftCards, isOwner = false }: GiftCardsNoBackgroundProps) => {
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
    <section className="py-16 px-4 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Gift className="w-12 h-12 text-white mx-auto mb-4" />
          <h2 className="text-template-subtitle mb-6 text-white">Wedding Gift</h2>
          <p className="text-lg text-white">For those who desire a wedding list is available</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {giftCards.map((card) => (
            <Card key={card.id} className="shadow-soft bg-gray-50 border border-gray-200">
              <CardContent className="p-6">
                <div className="flex-1 flex flex-col justify-center">
                  <div className="text-lg font-semibold text-gray-800">{card.card_name}</div>
                  <div className="flex items-center gap-2 mt-1 justify-between">
                    <p className="text-base font-mono text-gray-700">{card.card_number}</p>
                    <Copy
                      className="h-5 w-5 cursor-pointer text-gray-500 hover:text-gray-800 transition-colors"
                      onClick={() => copyToClipboard(card.card_number, card.card_name)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

import { Card, CardContent } from "@/components/ui/card";
import { Gift } from "lucide-react";

interface GiftCard {
  id: string;
  card_name: string;
  card_number: string;
  logo_url?: string;
}

interface GiftCardsProps {
  giftCards: GiftCard[];
}

export const GiftCards = ({ giftCards }: GiftCardsProps) => {
  if (!giftCards || giftCards.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-wedding-blush/20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Gift className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-primary mb-4">
            Wedding Gift
          </h2>
          <p className="text-lg text-muted-foreground">
            For those who desire a wedding list is available
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {giftCards.map((card) => (
            <Card key={card.id} className="shadow-soft">
              <CardContent className="p-6">
                {card.logo_url && (
                  <div className="mb-4 h-12 flex items-center justify-center">
                    <img
                      src={card.logo_url}
                      alt={card.card_name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2 text-center">{card.card_name}</h3>
                <p className="text-center text-lg font-mono bg-wedding-ivory p-3 rounded-lg">
                  {card.card_number}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
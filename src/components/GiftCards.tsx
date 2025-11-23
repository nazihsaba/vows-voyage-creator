import { Card, CardContent } from "@/components/ui/card";
import { Gift } from "lucide-react";
import omtLogo from "@/assets/omt-logo.jpg";
import whishLogo from "@/assets/whish-logo.png";

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
  if (!giftCards || giftCards.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-wedding-blush/20">
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2">
          {giftCards.map((card) => {
            const logoSrc = card.logo_url || getCardLogo(card.card_name);
            return (
              <Card key={card.id} className="shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {/* LEFT – Logo */}
                    {logoSrc && (
                      <div className="h-16 w-16 flex items-center justify-center">
                        <img
                          src={logoSrc}
                          alt={card.card_name}
                          className="max-h-full max-w-full object-contain rounded-[6px]"
                        />
                      </div>
                    )}

                    {/* RIGHT – Name + Number */}
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="text-lg font-semibold mb-1 text-foreground">{card.card_name}</h3>

                      <p className="text-sm md:text-base font-mono bg-wedding-ivory rounded-lg inline-flex items-center">
                        {card.card_number}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

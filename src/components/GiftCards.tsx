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

const maskCardNumber = (cardNumber: string): string => {
  if (cardNumber.length <= 4) return "****";
  return "****" + cardNumber.slice(-4);
};

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
        <div className="text-center mb-12">
          <Gift className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-primary mb-4">Wedding Gift</h2>
          <p className="text-lg text-muted-foreground">For those who desire a wedding list is available</p>
        </div>

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

                      <p className="text-sm md:text-base font-mono bg-wedding-ivory px-4 py-2 rounded-lg inline-flex items-center justify-center md:justify-start">
                        {isOwner ? card.card_number : maskCardNumber(card.card_number)}
                      </p>

                      {!isOwner && (
                        <p className="text-xs text-muted-foreground mt-2">Only showing last 4 digits for security</p>
                      )}
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

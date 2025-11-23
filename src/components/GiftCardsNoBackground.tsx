import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Gift } from "lucide-react";
import omtLogo from "@/assets/omt-logo.jpg";
import whishLogo from "@/assets/whish-logo.png";
import AOS from "aos";
import "aos/dist/aos.css";

interface GiftCard {
  id: string;
  card_name: string;
  card_number: string;
  logo_url?: string;
}

interface GiftCardsNoBackgroundProps {
  giftCards: GiftCard[];
  isOwner?: boolean;
}

const getCardLogo = (cardName: string): string | undefined => {
  const normalizedName = cardName.toLowerCase().trim();
  if (normalizedName.includes("omt")) return omtLogo;
  if (normalizedName.includes("whish")) return whishLogo;
  return undefined;
};

export const GiftCardsNoBackground = ({ giftCards, isOwner = false }: GiftCardsNoBackgroundProps) => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  if (!giftCards || giftCards.length === 0) return null;

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Gift className="w-12 h-12 text-white mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-white mb-4">Wedding Gift</h2>
          <p className="text-lg text-white">For those who desire a wedding list is available</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {giftCards.map((card, index) => {
            const logoSrc = card.logo_url || getCardLogo(card.card_name);
            return (
              <Card
                key={card.id}
                className="shadow-soft bg-white/10 backdrop-blur-sm"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {/* LEFT — Image */}
                    {logoSrc && (
                      <div className="h-16 w-16 flex items-center justify-center">
                        <img
                          src={logoSrc}
                          alt={card.card_name}
                          className="max-h-full max-w-full object-contain rounded-[6px]"
                        />
                      </div>
                    )}

                    {/* RIGHT — Title + Number */}
                    <div className="flex flex-col justify-center">
                      <h3 className="text-lg font-semibold text-white">{card.card_name}</h3>

                      <p className="text-sm font-mono bg-wedding-ivory rounded-lg text-white mt-1 text-center">
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

import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import templateModernRomance from "@/assets/template-modern-romance-new.jpg";
import templateRoseGold from "@/assets/template-rose-gold-elegant.jpg";
import templateClassic from "@/assets/template-wedding-classic.jpg";

const previewCards = [
  {
    image: templateModernRomance,
    label: "Modern",
    couple: "Sophie & Alexandre",
    date: "June 21, 2025",
    tagline: "Together forever starts here",
    featured: true,
  },
  {
    image: templateRoseGold,
    label: "Floral",
    couple: "Léa & Marc",
    date: "September 14, 2025",
    tagline: "Two hearts, one love",
    featured: false,
  },
  {
    image: templateClassic,
    label: "Classic",
    couple: "Emma & Nicolas",
    date: "December 6, 2025",
    tagline: "A timeless celebration",
    featured: false,
  },
];

const InvitationPreviewSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-4 bg-card">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-px w-10 bg-primary/40" />
            <Heart className="w-4 h-4 text-primary" />
            <div className="h-px w-10 bg-primary/40" />
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-5">
            See Your Wedding Invitation Come to Life
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Create and share stunning digital wedding invitations that capture the elegance of your special day — beautifully designed and ready in minutes.
          </p>
        </div>

        {/* Preview Cards — featured + 2 supporting */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-14">
          {/* Featured card */}
          <div className="lg:col-span-7 group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-500 aspect-[4/3] lg:aspect-auto lg:min-h-[480px]">
            <img
              src={previewCards[0].image}
              alt={previewCards[0].couple}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                {previewCards[0].label}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
              <p className="text-sm font-light tracking-widest uppercase mb-1 opacity-80">
                {previewCards[0].tagline}
              </p>
              <h3 className="text-2xl md:text-3xl font-serif font-bold mb-1">
                {previewCards[0].couple}
              </h3>
              <p className="text-sm font-light opacity-80">{previewCards[0].date}</p>
            </div>
          </div>

          {/* Two supporting cards stacked */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {previewCards.slice(1).map((card) => (
              <div
                key={card.couple}
                className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-500 flex-1 min-h-[220px]"
              >
                <img
                  src={card.image}
                  alt={card.couple}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                    {card.label}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <p className="text-xs font-light tracking-widest uppercase mb-1 opacity-80">
                    {card.tagline}
                  </p>
                  <h3 className="text-xl font-serif font-bold mb-0.5">{card.couple}</h3>
                  <p className="text-xs font-light opacity-80">{card.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            onClick={() => navigate("/dashboard")}
            className="text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            Browse Wedding Templates
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/demo")}
            className="text-lg px-8 py-6"
          >
            See How It Looks
          </Button>
        </div>
      </div>
    </section>
  );
};

export default InvitationPreviewSection;

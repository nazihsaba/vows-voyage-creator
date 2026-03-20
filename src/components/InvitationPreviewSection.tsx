import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import bibleVerseTabs from "@/assets/template-bible-verse.jpg";
import veriteTemplate from "@/assets/verite-preview-3.jpg";
import eclatTemplate from "@/assets/aura-preview-10.jpg";
import graceTemplate from "@/assets/preview-wedding-10.jpg";
import auraTemplate from "@/assets/eclat-wedding-2.jpg";

const previewCards = [
  {
    image: auraTemplate,
    label: "Aura",
    tagline: "Bible verse & botanical elegance",
    featured: true,
  },
  {
    image: veriteTemplate,
    label: "Vérité",
    tagline: "Contemporary gallery showcase",
    featured: false,
  },
  {
    image: eclatTemplate,
    label: "Éclat",
    tagline: "Elegant scrollable design",
    featured: false,
  },
  {
    image: graceTemplate,
    label: "Grâce",
    tagline: "Immersive video background",
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
          <p className="text-sm text-muted-foreground/70 italic tracking-wide mb-4">
            Designed for modern celebrations.
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Create and share stunning digital wedding invitations that capture the elegance of your special day —
            beautifully designed and ready in minutes.
          </p>
        </div>

        {/* Preview Cards — equal grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {previewCards.map((card) => (
            <div
              key={card.label}
              className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-500 aspect-[3/4]"
            >
              <img
                src={card.image}
                alt={card.label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
              <div className="absolute top-3 left-3">
                <span className="bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                  {card.label}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <p className="text-xs font-light tracking-widest uppercase opacity-80">{card.tagline}</p>
              </div>
            </div>
          ))}
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
          <Button size="lg" variant="outline" onClick={() => navigate("/demo")} className="text-lg px-8 py-6">
            See How It Looks
          </Button>
        </div>
      </div>
    </section>
  );
};

export default InvitationPreviewSection;

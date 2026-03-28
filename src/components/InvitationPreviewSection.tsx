import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import bibleVerseTabs from "@/assets/template-bible-verse.jpg";
import veriteTemplate from "@/assets/verite-preview-10.jpg";
import eclatTemplate from "@/assets/aura-preview-10.jpg";
import graceTemplate from "@/assets/preview-wedding-10.jpg";
import auraTemplate from "@/assets/eclat-wedding-2.jpg";

const previewCards = [
  {
    image: graceTemplate,
    label: "Grâce",
    tagline: "Immersive video background",
    featured: false,
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
    image: auraTemplate,
    label: "Dorée",
    tagline: "Quote highlight & botanical elegance",
    featured: true,
  },
];

const InvitationPreviewSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-4 bg-card">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          {/* <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-px w-10 bg-primary/40" />
            <Heart className="w-4 h-4 text-primary" />
            <div className="h-px w-10 bg-primary/40" />
          </div> */}
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

        {/* Preview Cards — carousel on mobile, grid on desktop */}
        {/* Mobile carousel */}
        <div className="mb-14 lg:hidden">
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {previewCards.map((card) => (
                <CarouselItem key={card.label} className="pl-4 basis-[85%] sm:basis-1/2">
                  <div className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-500 aspect-[3/4]">
                    <img
                      src={card.image}
                      alt={card.label}
                      loading="lazy"
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
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-2" />
            <CarouselNext className="-right-2" />
          </Carousel>
        </div>

        {/* Desktop grid */}
        <div className="hidden lg:grid grid-cols-4 gap-6 mb-14">
          {previewCards.map((card) => (
            <div
              key={card.label}
              className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-500 aspect-[3/4]"
            >
              <img
                src={card.image}
                alt={card.label}
                loading="eager"
                fetchPriority="high"
                decoding="sync"
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
        {/* <div className="flex justify-center">
          <Button
            size="lg"
            onClick={() => navigate("/dashboard")}
            className="text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            Browse Wedding Templates
          </Button>
        </div> */}
      </div>
    </section>
  );
};

export default InvitationPreviewSection;

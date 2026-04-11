import { useState, lazy, Suspense, useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Eye } from "lucide-react";
import bibleVerseTabs from "@/assets/template-bible-verse.jpg";
import veriteTemplate from "@/assets/verite-preview-10.jpg";
import eclatTemplate from "@/assets/aura-preview-10.jpg";
import graceTemplate from "@/assets/preview-wedding-10.jpg";
import auraTemplate from "@/assets/doree1.jpeg";
import lumiereTemplate from "@/assets/lumiere-4.jpg";
import etoileTemplate from "@/assets/etoile-6.jpg";

// Lazy load preview components
const GracePreview = lazy(() => import("@/components/templates/GracePreview"));
const VeritePreview = lazy(() => import("@/components/templates/VeritePreview"));
const EclatPreview = lazy(() => import("@/components/templates/EclatPreview"));
const AuraPreview = lazy(() => import("@/components/templates/AuraPreview").then((m) => ({ default: m.AuraPreview })));
const LumierePreview = lazy(() => import("@/components/templates/LumierePreview"));
const EtoilePreview = lazy(() => import("@/components/templates/EtoilePreview"));

type TemplateKey = "grace" | "verite" | "eclat" | "aura" | "lumiere" | "etoile";

const previewCards: { image: string; label: string; tagline: string; featured: boolean; templateKey: TemplateKey }[] = [
  {
    image: graceTemplate,
    label: "Grâce",
    tagline: "Immersive video background",
    featured: false,
    templateKey: "grace",
  },
  {
    image: veriteTemplate,
    label: "Vérité",
    tagline: "Contemporary gallery showcase",
    featured: false,
    templateKey: "verite",
  },
  {
    image: eclatTemplate,
    label: "Éclat",
    tagline: "Elegant scrollable design",
    featured: false,
    templateKey: "eclat",
  },
  {
    image: auraTemplate,
    label: "Dorée",
    tagline: "Quote highlight & botanical elegance",
    featured: true,
    templateKey: "aura",
  },
  {
    image: lumiereTemplate,
    label: "Lumière",
    tagline: "Cinematic video & torn-edge cards",
    featured: false,
    templateKey: "lumiere",
  },
  {
    image: etoileTemplate,
    label: "Étoile",
    tagline: "PHOTO CAROUSEL & ANIMATED CARDS",
    featured: false,
    templateKey: "etoile",
  },
];

const templateComponents: Record<TemplateKey, React.LazyExoticComponent<React.ComponentType>> = {
  grace: GracePreview,
  verite: VeritePreview,
  eclat: EclatPreview,
  aura: AuraPreview,
  lumiere: LumierePreview,
  etoile: EtoilePreview,
};

const PreviewLoadingFallback = () => (
  <div className="flex items-center justify-center h-[60vh]">
    <div className="text-center space-y-4">
      <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
      <p className="text-muted-foreground text-sm">Loading preview…</p>
    </div>
  </div>
);

const TemplateCard = ({
  card,
  onPreview,
}: {
  card: (typeof previewCards)[0];
  onPreview: (key: TemplateKey) => void;
}) => (
  <div
    className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-500 aspect-[3/4] cursor-pointer"
    onClick={() => onPreview(card.templateKey)}
  >
    <img
      src={card.image}
      alt={card.label}
      loading="lazy"
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />

    {/* Eye icon badge */}
    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center">
        <Eye className="w-4 h-4 text-white" />
      </div>
    </div>

    {/* Label badge */}
    <div className="absolute top-3 left-3">
      <span className="bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
        {card.label}
      </span>
    </div>

    {/* Tagline */}
    <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
      <p className="text-xs font-light tracking-widest uppercase opacity-80">{card.tagline}</p>
    </div>
  </div>
);

const InvitationPreviewSection = () => {
  const navigate = useNavigate();
  const [activePreview, setActivePreview] = useState<TemplateKey | null>(null);
  const autoplayMobile = useRef(Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true }));
  const autoplayDesktop = useRef(Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true }));

  const ActiveComponent = activePreview ? templateComponents[activePreview] : null;
  const activeLabel = activePreview ? previewCards.find((c) => c.templateKey === activePreview)?.label : "";

  return (
    <section className="py-24 px-4 bg-card">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <p className="text-sm uppercase tracking-[0.3em] text-primary/70 font-medium mb-3">Our Templates</p>
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

        {/* Mobile carousel */}
        <div className="mb-14 lg:hidden">
          <Carousel opts={{ align: "start", loop: true }} plugins={[autoplayMobile.current]} className="w-full">
            <CarouselContent className="-ml-4">
              {previewCards.map((card) => (
                <CarouselItem key={card.label} className="pl-4 basis-[85%] sm:basis-1/2">
                  <TemplateCard card={card} onPreview={setActivePreview} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-2" />
            <CarouselNext className="-right-2" />
          </Carousel>
        </div>

        {/* Desktop carousel */}
        <div className="hidden lg:block mb-14">
          <Carousel opts={{ align: "start", loop: true }} plugins={[autoplayDesktop.current]} className="w-full">
            <CarouselContent className="-ml-6">
              {previewCards.map((card) => (
                <CarouselItem key={card.label} className="pl-6 basis-1/4">
                  <TemplateCard card={card} onPreview={setActivePreview} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-5" />
            <CarouselNext className="-right-5" />
          </Carousel>
        </div>
      </div>

      {/* Fullscreen Preview Dialog */}
      <Dialog open={!!activePreview} onOpenChange={(open) => !open && setActivePreview(null)}>
        <DialogContent className="max-w-full w-full h-[100dvh] p-0 border-none rounded-none bg-white [&>button]:hidden overflow-hidden">
          {/* Sticky header bar */}
          <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md border-b border-border/50">
            <span className="text-sm font-semibold text-foreground tracking-wide">{activeLabel} — Preview</span>
            <button
              onClick={() => setActivePreview(null)}
              className="p-2 rounded-full hover:bg-muted transition-colors border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
              aria-label="Close preview"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          </div>

          {/* Scrollable preview body */}
          <div className="overflow-y-auto h-[calc(100dvh-52px)]">
            <Suspense fallback={<PreviewLoadingFallback />}>{ActiveComponent && <ActiveComponent />}</Suspense>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default InvitationPreviewSection;

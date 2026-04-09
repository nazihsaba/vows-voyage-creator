import { AnimatedSection } from "@/hooks/useScrollAnimation";

interface GalleryImage {
  id: string;
  image_url: string;
  alt_text?: string | null;
}

interface GallerySectionProps {
  images: GalleryImage[];
  fallbackUrl?: string;
  mode?: "single" | "grid";
  className?: string;
  imageClassName?: string;
}

const GallerySection = ({
  images,
  fallbackUrl = "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&h=800&fit=crop",
  mode = "single",
  className = "",
  imageClassName = "w-full h-full object-cover",
}: GallerySectionProps) => {
  if (mode === "single") {
    const src = images.length > 0 ? images[0].image_url : fallbackUrl;
    return (
      <AnimatedSection animation="fade-in">
        <section className={`relative w-full ${className}`}>
          <div className="w-full h-[50vh] md:h-[60vh] overflow-hidden">
            <img src={src} alt="Wedding moment" loading="lazy" className={imageClassName} />
          </div>
        </section>
      </AnimatedSection>
    );
  }

  // Grid mode
  const displayImages = images.length > 0 ? images : [{ id: "fallback", image_url: fallbackUrl }];
  return (
    <section className={`py-16 px-4 ${className}`}>
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
        {displayImages.map((img, i) => (
          <AnimatedSection key={img.id} delay={i * 100} animation="scale-in">
            <div className="aspect-square overflow-hidden rounded-lg">
              <img
                src={img.image_url}
                alt={img.alt_text || `Photo ${i + 1}`}
                loading="lazy"
                className={imageClassName}
              />
            </div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
};

export default GallerySection;

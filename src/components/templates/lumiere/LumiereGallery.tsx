import { useTranslation } from "react-i18next";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import LumiereTornCard from "./LumiereTornCard";

interface GalleryImage {
  id?: string;
  image_url: string;
  alt_text?: string | null;
  position_y?: number | null;
}

interface LumiereGalleryProps {
  images: GalleryImage[];
  subtitle?: string | null;
}

const LumiereGallery = ({ images, subtitle }: LumiereGalleryProps) => {
  const { t } = useTranslation();
  if (!images || images.length === 0) return null;

  return (
    <LumiereTornCard>
      <div className="py-14 px-6">
        <AnimatedSection animation="fade-in">
          <h2 className="text-template-heading text-center text-black mb-2">{t("gallery.title")}</h2>
          {subtitle && (
            <p className="text-center text-template-body text-black/70 mb-8 px-4">{subtitle}</p>
          )}
        </AnimatedSection>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
          {images.map((image, index) => (
            <AnimatedSection key={image.id || index} delay={index * 80} animation="scale-in">
              <div className="aspect-square overflow-hidden rounded-lg">
                <img
                  src={image.image_url}
                  alt={image.alt_text || `Wedding moment ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  style={{ objectPosition: `50% ${Math.min(100, Math.max(0, image.position_y ?? 50))}%` }}
                  loading="lazy"
                />
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </LumiereTornCard>
  );
};

export default LumiereGallery;

import { useTranslation } from "react-i18next";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import EtoileTornCard from "./EtoileTornCard";

interface GalleryImage {
  id?: string;
  image_url: string;
  alt_text?: string | null;
}

interface EtoileGalleryProps {
  images: GalleryImage[];
  align?: "left" | "right";
}

const EtoileGallery = ({ images, align = "left" }: EtoileGalleryProps) => {
  const { t } = useTranslation();
  if (!images || images.length === 0) return null;

  return (
    <EtoileTornCard align={align}>
      <div className="py-14 px-6">
        <AnimatedSection animation="fade-in">
          <h2 className="text-template-subtitle text-center text-black mb-8">{t("gallery.title")}</h2>
        </AnimatedSection>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
          {images.map((image, index) => (
            <AnimatedSection key={image.id || index} delay={index * 80} animation="scale-in">
              <div className="aspect-square overflow-hidden rounded-lg">
                <img
                  src={image.image_url}
                  alt={image.alt_text || `Wedding moment ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </EtoileTornCard>
  );
};

export default EtoileGallery;

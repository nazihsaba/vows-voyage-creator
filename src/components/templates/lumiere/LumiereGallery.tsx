import { AnimatedSection } from "@/hooks/useScrollAnimation";
import LumiereTornCard from "./LumiereTornCard";

interface GalleryImage {
  id?: string;
  image_url: string;
  alt_text?: string | null;
}

interface LumiereGalleryProps {
  images: GalleryImage[];
  title?: string;
}

const LumiereGallery = ({ images, title = "Our Moments" }: LumiereGalleryProps) => {
  if (!images || images.length === 0) return null;

  return (
    <LumiereTornCard>
      <div className="py-14 px-6">
        <AnimatedSection animation="fade-in">
          <h2 className="font-['Dancing_Script'] text-3xl md:text-4xl text-center text-gray-800 mb-8">{title}</h2>
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
    </LumiereTornCard>
  );
};

export default LumiereGallery;

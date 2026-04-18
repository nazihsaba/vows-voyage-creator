interface WeddingGalleryProps {
  images: Array<{ id: string; image_url: string; alt_text?: string; position_y?: number | null }>;
}

export const WeddingGallery = ({ images }: WeddingGalleryProps) => {
  if (!images || images.length === 0) return null;

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="aspect-square overflow-hidden rounded-lg shadow-soft hover:shadow-elegant transition-all duration-300 hover:scale-105"
            >
              <img
                src={image.image_url}
                alt={image.alt_text || `Wedding photo ${index + 1}`}
                className="w-full h-full object-cover"
                style={{ objectPosition: `50% ${Math.min(100, Math.max(0, image.position_y ?? 50))}%` }}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
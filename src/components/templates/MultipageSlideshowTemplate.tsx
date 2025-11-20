import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditableField } from '@/components/EditableField';

interface MultipageSlideshowTemplateProps {
  wedding: any;
  isOwner: boolean;
  isPreview?: boolean;
  onFieldUpdate?: (fieldId: string, text: string, style: any) => void;
  getFieldValue?: (fieldId: string, defaultValue: string) => string;
  getFieldStyle?: (fieldId: string) => any;
}

const MultipageSlideshowTemplate = ({
  wedding,
  isOwner,
  isPreview = false,
  onFieldUpdate = () => {},
  getFieldValue = (_, defaultValue) => defaultValue,
  getFieldStyle = () => ({}),
}: MultipageSlideshowTemplateProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Slideshow images - using wedding gallery or default images
  const images = wedding.gallery_images?.map((img: any) => img.image_url) || [
    wedding.main_picture_url,
  ].filter(Boolean);

  // Slideshow effect
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
        setIsTransitioning(false);
      }, 800);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  const nextPage = () => {
    if (currentPage < 6) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return (
          <div className="text-center space-y-8 animate-fade-in">
            <EditableField
              fieldId="page1_title"
              text={getFieldValue('page1_title', wedding.groom_name && wedding.bride_name 
                ? `${wedding.groom_name} & ${wedding.bride_name}` 
                : 'Our Wedding')}
              style={getFieldStyle('page1_title')}
              onUpdate={onFieldUpdate}
              isPreview={isOwner && !isPreview}
              className="text-6xl md:text-8xl font-bold tracking-wider text-white drop-shadow-2xl"
            />
            <EditableField
              fieldId="page1_subtitle"
              text={getFieldValue('page1_subtitle', 'We are getting married')}
              style={getFieldStyle('page1_subtitle')}
              onUpdate={onFieldUpdate}
              isPreview={isOwner && !isPreview}
              className="text-2xl md:text-3xl text-white/90 font-light tracking-widest"
            />
          </div>
        );

      case 2:
        return (
          <div className="text-center space-y-6 animate-fade-in max-w-2xl">
            <EditableField
              fieldId="page2_title"
              text={getFieldValue('page2_title', 'Save The Date')}
              style={getFieldStyle('page2_title')}
              onUpdate={onFieldUpdate}
              isPreview={isOwner && !isPreview}
              className="text-5xl md:text-6xl font-bold text-white drop-shadow-2xl"
            />
            <EditableField
              fieldId="page2_date"
              text={getFieldValue('page2_date', new Date(wedding.wedding_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }))}
              style={getFieldStyle('page2_date')}
              onUpdate={onFieldUpdate}
              isPreview={isOwner && !isPreview}
              className="text-3xl md:text-4xl text-white/90 font-light"
            />
          </div>
        );

      case 3:
        return (
          <div className="text-center space-y-8 animate-fade-in max-w-3xl">
            <EditableField
              fieldId="page3_title"
              text={getFieldValue('page3_title', 'Our Story')}
              style={getFieldStyle('page3_title')}
              onUpdate={onFieldUpdate}
              isPreview={isOwner && !isPreview}
              className="text-5xl md:text-6xl font-bold text-white drop-shadow-2xl"
            />
            <EditableField
              fieldId="page3_story"
              text={getFieldValue('page3_story', wedding.main_description || 'Every love story is beautiful, but ours is our favorite. Join us as we celebrate the beginning of our forever together.')}
              style={getFieldStyle('page3_story')}
              onUpdate={onFieldUpdate}
              isPreview={isOwner && !isPreview}
              multiline
              className="text-xl md:text-2xl text-white/90 font-light leading-relaxed"
            />
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6 animate-fade-in max-w-2xl">
            <EditableField
              fieldId="page4_title"
              text={getFieldValue('page4_title', 'Celebration Details')}
              style={getFieldStyle('page4_title')}
              onUpdate={onFieldUpdate}
              isPreview={isOwner && !isPreview}
              className="text-5xl md:text-6xl font-bold text-white drop-shadow-2xl mb-12"
            />
            {wedding.wedding_locations?.map((location: any, index: number) => (
              <div key={location.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-8 space-y-3">
                <h3 className="text-3xl font-semibold text-white">{location.type}</h3>
                {location.location_name && (
                  <p className="text-xl text-white/90">{location.location_name}</p>
                )}
                {location.time && (
                  <p className="text-lg text-white/80">{location.time}</p>
                )}
              </div>
            ))}
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-6 animate-fade-in max-w-2xl">
            <EditableField
              fieldId="page5_title"
              text={getFieldValue('page5_title', 'Gift Registry')}
              style={getFieldStyle('page5_title')}
              onUpdate={onFieldUpdate}
              isPreview={isOwner && !isPreview}
              className="text-5xl md:text-6xl font-bold text-white drop-shadow-2xl"
            />
            <EditableField
              fieldId="page5_message"
              text={getFieldValue('page5_message', 'Your presence is the greatest gift of all. However, if you wish to honor us with a gift, we have registered at the following:')}
              style={getFieldStyle('page5_message')}
              onUpdate={onFieldUpdate}
              isPreview={isOwner && !isPreview}
              multiline
              className="text-xl md:text-2xl text-white/90 font-light"
            />
            {wedding.gift_cards?.length > 0 && (
              <div className="grid gap-4 mt-8">
                {wedding.gift_cards.map((card: any) => (
                  <div key={card.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                    <p className="text-2xl font-semibold text-white">{card.card_name}</p>
                    <p className="text-lg text-white/80 mt-2">{card.card_number}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="text-center space-y-8 animate-fade-in">
            <EditableField
              fieldId="page6_title"
              text={getFieldValue('page6_title', 'See You There!')}
              style={getFieldStyle('page6_title')}
              onUpdate={onFieldUpdate}
              isPreview={isOwner && !isPreview}
              className="text-6xl md:text-8xl font-bold text-white drop-shadow-2xl"
            />
            <EditableField
              fieldId="page6_closing"
              text={getFieldValue('page6_closing', wedding.closing_message || 'We cannot wait to celebrate with you!')}
              style={getFieldStyle('page6_closing')}
              onUpdate={onFieldUpdate}
              isPreview={isOwner && !isPreview}
              multiline
              className="text-2xl md:text-3xl text-white/90 font-light"
            />
            <div className="text-white/80 text-lg mt-12">
              <p>{wedding.groom_name} & {wedding.bride_name}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Background Slideshow */}
      <div
        className={`fixed inset-0 bg-cover bg-center transition-opacity duration-800 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          backgroundImage: images[currentImageIndex] 
            ? `url(${images[currentImageIndex]})` 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      />

      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {renderPage()}

        {/* Navigation */}
        <div className="fixed bottom-8 left-0 right-0 flex items-center justify-center gap-4 px-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevPage}
            disabled={currentPage === 1}
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white disabled:opacity-30"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-3 h-3 rounded-full transition-all ${
                  currentPage === page
                    ? 'bg-white w-8'
                    : 'bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to page ${page}`}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={nextPage}
            disabled={currentPage === 6}
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white disabled:opacity-30"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MultipageSlideshowTemplate;

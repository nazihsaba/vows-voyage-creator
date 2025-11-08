import { Template, TemplateSectionConfig } from '@/types/templates';
import { EditableField } from '@/components/EditableField';
import { EditableImage } from '@/components/EditableImage';
import { EventLocation } from '@/components/EventLocation';
import { GiftCards } from '@/components/GiftCards';
import { CountdownTimer } from '@/components/CountdownTimer';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface AnthonyOdileCarouselTemplateProps {
  template: Template;
  wedding: any;
  locations: any[];
  gallery: any[];
  giftCards: any[];
  isPreview?: boolean;
  onFieldUpdate?: (fieldId: string, value: string, styleOverrides?: any) => void;
  onImageUpdate?: (imageUrl: string) => void;
  getFieldValue?: (fieldId: string, fallback: string) => string;
  getFieldStyle?: (fieldId: string) => any;
}

export const AnthonyOdileCarouselTemplate = ({
  template,
  wedding,
  locations = [],
  gallery = [],
  giftCards = [],
  isPreview = false,
  onFieldUpdate,
  onImageUpdate,
  getFieldValue,
  getFieldStyle,
}: AnthonyOdileCarouselTemplateProps) => {
  const getValue = (fieldId: string, fallback: string) => 
    getFieldValue ? getFieldValue(fieldId, fallback) : fallback;

  const getStyle = (fieldId: string) => 
    getFieldStyle ? getFieldStyle(fieldId) : {};

  return (
    <div 
      className="min-h-screen font-serif"
      style={{
        fontFamily: template.style.fontPrimary,
        backgroundColor: template.style.colorScheme.background,
        color: template.style.colorScheme.text,
      }}
    >
      {/* Hero Section */}
      <section className="relative h-screen">
        <EditableImage
          imageUrl={wedding.main_image_url}
          alt="Wedding couple"
          onUpdate={onImageUpdate || (() => {})}
          isPreview={isPreview}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <EditableField
              fieldId="couple_names"
              text={getValue('couple_names', `${wedding.bride_name || 'Bride'} & ${wedding.groom_name || 'Groom'}`)}
              onUpdate={onFieldUpdate || (() => {})}
              isPreview={isPreview}
              className="font-script text-6xl md:text-8xl mb-6"
              style={{ 
                fontFamily: "'Dancing Script', cursive",
                ...getStyle('couple_names')
              }}
            />
            <EditableField
              fieldId="wedding_date"
              text={getValue('wedding_date', new Date(wedding.wedding_date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }))}
              onUpdate={onFieldUpdate || (() => {})}
              isPreview={isPreview}
              className="text-2xl md:text-3xl tracking-wider"
              style={getStyle('wedding_date')}
            />
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 max-w-4xl mx-auto text-center">
        <EditableField
          fieldId="story_title"
          text={getValue('story_title', 'Our Story')}
          onUpdate={onFieldUpdate || (() => {})}
          isPreview={isPreview}
          className="text-4xl md:text-5xl font-bold mb-8"
          style={{
            color: template.style.colorScheme.primary,
            ...getStyle('story_title')
          }}
        />
        <EditableField
          fieldId="story_content"
          text={getValue('story_content', wedding.love_story || 'Our beautiful journey together...')}
          onUpdate={onFieldUpdate || (() => {})}
          isPreview={isPreview}
          className="text-lg leading-relaxed"
          style={{
            fontFamily: template.style.fontSecondary,
            ...getStyle('story_content')
          }}
          multiline
        />
      </section>

      {/* Carousel Gallery Section */}
      {gallery && gallery.length > 0 && (
        <section className="py-20 px-4 bg-gradient-to-b from-transparent via-accent/10 to-transparent">
          <div className="max-w-6xl mx-auto">
            <h2 
              className="text-4xl md:text-5xl font-bold text-center mb-12"
              style={{ color: template.style.colorScheme.primary }}
            >
              Our Moments
            </h2>
            <Carousel className="w-full">
              <CarouselContent>
                {gallery.map((image, index) => (
                  <CarouselItem key={image.id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-2">
                      <div className="aspect-square overflow-hidden rounded-lg">
                        <img
                          src={image.image_url}
                          alt={image.alt_text || `Gallery photo ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          </div>
        </section>
      )}

      {/* Countdown Section */}
      <section className="py-20 px-4 text-center">
        <h2 
          className="text-4xl md:text-5xl font-bold mb-12"
          style={{ color: template.style.colorScheme.primary }}
        >
          Counting Down
        </h2>
        <CountdownTimer targetDate={new Date(wedding.wedding_date)} />
      </section>

      {/* Location Section */}
      {locations && locations.length > 0 && (
        <section className="py-20 px-4 bg-accent/5">
          <div className="max-w-6xl mx-auto">
            <h2 
              className="text-4xl md:text-5xl font-bold text-center mb-12"
              style={{ color: template.style.colorScheme.primary }}
            >
              Event Details
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {locations.map((location) => (
                <EventLocation 
                  key={location.id} 
                  type={location.location_type === 'Ceremony' ? 'ceremony' : 'venue'}
                  locationName={`${location.venue_name} - ${location.address}`}
                  locationLink={location.map_url}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gift Cards Section */}
      {giftCards && giftCards.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 
              className="text-4xl md:text-5xl font-bold text-center mb-12"
              style={{ color: template.style.colorScheme.primary }}
            >
              Gift Registry
            </h2>
            <GiftCards giftCards={giftCards} />
          </div>
        </section>
      )}

      {/* RSVP Section */}
      <section 
        className="py-20 px-4 text-center text-white"
        style={{ backgroundColor: template.style.colorScheme.primary }}
      >
        <div className="max-w-2xl mx-auto">
          <EditableField
            fieldId="rsvp_title"
            text={getValue('rsvp_title', 'Join Our Celebration')}
            onUpdate={onFieldUpdate || (() => {})}
            isPreview={isPreview}
            className="text-4xl md:text-5xl font-bold mb-6"
            style={getStyle('rsvp_title')}
          />
          <EditableField
            fieldId="rsvp_message"
            text={getValue('rsvp_message', 'Please let us know if you can join us on our special day')}
            onUpdate={onFieldUpdate || (() => {})}
            isPreview={isPreview}
            className="text-lg mb-8"
            style={getStyle('rsvp_message')}
            multiline
          />
          
          {wedding.rsvp_deadline && (
            <div className="pt-8 border-t border-white/20 mt-8">
              <p className="text-lg uppercase tracking-widest mb-2 text-white/90">
                Kindly confirm your attendance before this date:
              </p>
              <p className="text-3xl font-bold">
                {new Date(wedding.rsvp_deadline).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

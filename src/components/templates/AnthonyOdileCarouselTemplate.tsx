import { useState } from 'react';
import { Template, TemplateSectionConfig } from '@/types/templates';
import { EditableField } from '@/components/EditableField';
import { EditableImage } from '@/components/EditableImage';
import { EventLocation } from '@/components/EventLocation';
import { GiftCards } from '@/components/GiftCards';
import { CountdownTimer } from '@/components/CountdownTimer';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const translations = {
  en: {
    ourStory: 'Our Story',
    ourMoments: 'Our Moments',
    countingDown: 'Counting Down',
    eventDetails: 'Event Details',
    giftRegistry: 'Gift Registry',
    joinCelebration: 'Join Our Celebration',
    rsvpMessage: 'Please let us know if you can join us on our special day',
    confirmBefore: 'Kindly confirm your attendance before this date:',
  },
  ar: {
    ourStory: 'قصتنا',
    ourMoments: 'لحظاتنا',
    countingDown: 'العد التنازلي',
    eventDetails: 'تفاصيل الحدث',
    giftRegistry: 'سجل الهدايا',
    joinCelebration: 'انضموا إلى احتفالنا',
    rsvpMessage: 'يرجى إعلامنا إذا كنتم ستنضمون إلينا في يومنا المميز',
    confirmBefore: 'يرجى تأكيد حضوركم قبل هذا التاريخ:',
  }
};

interface AnthonyOdileCarouselTemplateProps {
  template: Template;
  wedding: any;
  locations: any[];
  gallery: any[];
  giftCards: any[];
  isOwner?: boolean;
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
  isOwner = false,
  isPreview = false,
  onFieldUpdate,
  onImageUpdate,
  getFieldValue,
  getFieldStyle,
}: AnthonyOdileCarouselTemplateProps) => {
  const [isArabic, setIsArabic] = useState(false);
  const t = translations[isArabic ? 'ar' : 'en'];

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
        direction: isArabic ? 'rtl' : 'ltr',
      }}
    >
      {/* Language Toggle */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
        <Label htmlFor="arabic-toggle" className="text-sm font-medium text-gray-700">
          {isArabic ? 'العربية' : 'EN'}
        </Label>
        <Switch
          id="arabic-toggle"
          checked={isArabic}
          onCheckedChange={setIsArabic}
        />
        <Label htmlFor="arabic-toggle" className="text-sm font-medium text-gray-700">
          {isArabic ? 'EN' : 'العربية'}
        </Label>
      </div>
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
              className="text-template-title mb-6"
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
              className="text-template-body tracking-wider"
              style={getStyle('wedding_date')}
            />
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 max-w-4xl mx-auto text-center">
        <EditableField
          fieldId="story_title"
          text={getValue('story_title', t.ourStory)}
          onUpdate={onFieldUpdate || (() => {})}
          isPreview={isPreview}
          className="text-template-subtitle mb-8"
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
          className="text-template-body"
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
              className="text-template-subtitle text-center mb-12"
              style={{ color: template.style.colorScheme.primary }}
            >
              {t.eventDetails}
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
              className="text-template-subtitle text-center mb-12"
              style={{ color: template.style.colorScheme.primary }}
            >
              {t.giftRegistry}
            </h2>
            <GiftCards giftCards={giftCards} isOwner={isOwner} />
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
            text={getValue('rsvp_title', t.joinCelebration)}
            onUpdate={onFieldUpdate || (() => {})}
            isPreview={isPreview}
            className="text-template-subtitle mb-6"
            style={getStyle('rsvp_title')}
          />
          <EditableField
            fieldId="rsvp_message"
            text={getValue('rsvp_message', t.rsvpMessage)}
            onUpdate={onFieldUpdate || (() => {})}
            isPreview={isPreview}
            className="text-template-body mb-8"
            style={getStyle('rsvp_message')}
            multiline
          />
          
          {wedding.rsvp_deadline && (
            <div className="pt-8 border-t border-white/20 mt-8">
              <p className="text-template-small text-white/90 mb-2">
                {t.confirmBefore}
              </p>
              <p className="text-template-heading">
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

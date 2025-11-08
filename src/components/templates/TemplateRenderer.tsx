import { Template, TemplateSectionConfig } from '@/types/templates';
import { CountdownTimer } from '@/components/CountdownTimer';
import { WeddingGallery } from '@/components/WeddingGallery';
import { EventLocation } from '@/components/EventLocation';
import { GiftCards } from '@/components/GiftCards';
import { EditableField } from '@/components/EditableField';
import { AnthonyOdileTemplate } from './AnthonyOdileTemplate';
import { AnthonyOdileCarouselTemplate } from './AnthonyOdileCarouselTemplate';
import { ModernTemplate } from './ModernTemplate';
import { ReactNode } from 'react';

interface TemplateRendererProps {
  template: Template;
  wedding: any;
  locations: any[];
  gallery: any[];
  giftCards: any[];
  isPreview: boolean;
  onFieldUpdate: (fieldId: string, text: string, style: any) => void;
  getFieldValue: (fieldId: string, defaultValue: string) => string;
  getFieldStyle: (fieldId: string) => any;
  children?: ReactNode;
}

export const TemplateRenderer = ({
  template,
  wedding,
  locations,
  gallery,
  giftCards,
  isPreview,
  onFieldUpdate,
  getFieldValue,
  getFieldStyle,
  children,
}: TemplateRendererProps) => {
  // Use custom template component if specified
  if (template.component === 'AnthonyOdileTemplate') {
    return (
      <AnthonyOdileTemplate
        wedding={wedding}
        locations={locations}
        gallery={gallery}
        giftCards={giftCards}
        isPreview={isPreview}
        onFieldUpdate={onFieldUpdate}
        getFieldValue={getFieldValue}
        getFieldStyle={getFieldStyle}
      />
    );
  }

  if (template.component === 'AnthonyOdileCarouselTemplate') {
    return (
      <AnthonyOdileCarouselTemplate
        template={template}
        wedding={wedding}
        locations={locations}
        gallery={gallery}
        giftCards={giftCards}
        isPreview={isPreview}
        onFieldUpdate={onFieldUpdate}
        getFieldValue={getFieldValue}
        getFieldStyle={getFieldStyle}
      />
    );
  }

  if (template.component === 'ModernTemplate') {
    return (
      <ModernTemplate
        wedding={wedding}
        locations={locations}
        gallery={gallery}
        giftCards={giftCards}
        isPreview={isPreview}
        onFieldUpdate={onFieldUpdate}
        getFieldValue={getFieldValue}
        getFieldStyle={getFieldStyle}
      />
    );
  }

  // Sort sections by order
  const sortedSections = [...template.sections].sort((a, b) => a.order - b.order);
  
  // Extract ceremony and venue from locations
  const ceremony = locations.find(loc => loc.type === 'ceremony');
  const venue = locations.find(loc => loc.type === 'venue');

  const renderSection = (section: TemplateSectionConfig) => {
    if (!section.enabled) return null;

    const style = template.style;
    const baseClasses = "w-full px-4 md:px-8 py-12 md:py-16";

    switch (section.id) {
      case 'hero':
        return (
          <section key={section.id} className={`${baseClasses} text-center`}>
            {children}
          </section>
        );

      case 'story':
        return wedding.main_description ? (
          <section 
            key={section.id} 
            className={baseClasses}
            style={{ 
              backgroundColor: style.colorScheme.accent,
              fontFamily: style.fontSecondary,
            }}
          >
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <EditableField
                fieldId="story-title"
                text={getFieldValue("story-title", "Our Story")}
                style={getFieldStyle("story-title")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="h2"
                className="text-3xl md:text-4xl font-bold"
              />
              <EditableField
                fieldId="main-description"
                text={getFieldValue("main-description", wedding.main_description)}
                style={getFieldStyle("main-description")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                multiline={true}
                tag="p"
                className="text-lg leading-relaxed"
              />
            </div>
          </section>
        ) : null;

      case 'countdown':
        return (
          <section 
            key={section.id} 
            className={baseClasses}
            style={{ backgroundColor: style.colorScheme.background }}
          >
            <CountdownTimer targetDate={wedding.wedding_date} />
          </section>
        );

      case 'details':
        return (
          <section 
            key={section.id} 
            className={baseClasses}
            style={{ 
              backgroundColor: style.colorScheme.accent,
              fontFamily: style.fontSecondary,
            }}
          >
            <div className="max-w-2xl mx-auto text-center space-y-8">
              <EditableField
                fieldId="details-title"
                text={getFieldValue("details-title", "Event Details")}
                style={getFieldStyle("details-title")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="h2"
                className="text-3xl md:text-4xl font-bold"
              />
            </div>
          </section>
        );

      case 'location':
        return (ceremony || venue) ? (
          <section 
            key={section.id} 
            className={baseClasses}
            style={{ backgroundColor: style.colorScheme.background }}
          >
            <div className="max-w-4xl mx-auto space-y-8">
              <h2 
                className="text-3xl md:text-4xl font-bold text-center mb-12"
                style={{ 
                  fontFamily: style.fontPrimary,
                  color: style.colorScheme.primary,
                }}
              >
                Location & Time
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {ceremony && (
                  <EventLocation
                    type="ceremony"
                    locationName={ceremony.location_name}
                    locationLink={ceremony.location_link}
                    time={ceremony.time}
                  />
                )}
                {venue && (
                  <EventLocation
                    type="venue"
                    locationName={venue.location_name}
                    locationLink={venue.location_link}
                    time={venue.time}
                  />
                )}
              </div>
            </div>
          </section>
        ) : null;

      case 'gallery':
        return gallery.length > 0 ? (
          <section 
            key={section.id} 
            className={baseClasses}
            style={{ backgroundColor: style.colorScheme.accent }}
          >
            <WeddingGallery images={gallery} />
          </section>
        ) : null;

      case 'gifts':
        return giftCards.length > 0 ? (
          <section 
            key={section.id} 
            className={baseClasses}
            style={{ backgroundColor: style.colorScheme.background }}
          >
            <GiftCards giftCards={giftCards} />
          </section>
        ) : null;

      case 'rsvp':
        // RSVP section placeholder for future implementation
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {sortedSections.map(renderSection)}
    </div>
  );
};

import { Template, TemplateSectionConfig } from '@/types/templates';
import { CountdownTimer } from '@/components/CountdownTimer';
import { WeddingGallery } from '@/components/WeddingGallery';
import { EventLocation } from '@/components/EventLocation';
import { GiftCards } from '@/components/GiftCards';
import { EditableField } from '@/components/EditableField';
import { VeriteTemplate } from './VeriteTemplate';
import { GraceTemplate } from './GraceTemplate';
import { EclatTemplate } from './EclatTemplate';
import { AuraTemplate } from './AuraTemplate';
import { OpulenceTemplate } from './OpulenceTemplate';
import { LumiereTemplate } from './LumiereTemplate';
import { EtoileTemplate } from './EtoileTemplate';
import { TresorTemplate } from './TresorTemplate';
import { ReactNode } from 'react';

interface TemplateRendererProps {
  template: Template;
  wedding: any;
  locations: any[];
  gallery: any[];
  giftCards: any[];
  isOwner?: boolean;
  isPreview: boolean;
  onFieldUpdate: (fieldId: string, text: string, style: any) => void;
  getFieldValue: (fieldId: string, defaultValue: string) => string;
  getFieldStyle: (fieldId: string) => any;
  children?: ReactNode;
  invitees?: any[];
  rsvpResponses?: Record<string, boolean | null>;
  handleRsvpToggle?: (inviteeId: string, isAttending: boolean | null) => void;
  handleRsvpSubmit?: (wishesMessage?: string) => void;
  numberOfPersons?: number;
  isRsvpDeadlinePassed?: boolean;
  submittingRsvp?: boolean;
}

export const TemplateRenderer = ({
  template,
  wedding,
  locations,
  gallery,
  giftCards,
  isOwner = false,
  isPreview,
  onFieldUpdate,
  getFieldValue,
  getFieldStyle,
  children,
  invitees = [],
  rsvpResponses = {},
  handleRsvpToggle = () => {},
  handleRsvpSubmit = () => {},
  numberOfPersons = 0,
  isRsvpDeadlinePassed = false,
  submittingRsvp = false,
}: TemplateRendererProps) => {
  // Use custom template component if specified
  if (template.component === 'VeriteTemplate') {
    return (
      <VeriteTemplate
        wedding={wedding}
        locations={locations}
        gallery={gallery}
        giftCards={giftCards}
        isOwner={isOwner}
        isPreview={isPreview}
        onFieldUpdate={onFieldUpdate}
        getFieldValue={getFieldValue}
        getFieldStyle={getFieldStyle}
        invitees={invitees}
        rsvpResponses={rsvpResponses}
        handleRsvpToggle={handleRsvpToggle}
        handleRsvpSubmit={handleRsvpSubmit}
        numberOfPersons={numberOfPersons}
        isRsvpDeadlinePassed={isRsvpDeadlinePassed}
        submittingRsvp={submittingRsvp}
      />
    );
  }

  if (template.component === 'GraceTemplate') {
    return (
      <GraceTemplate
        wedding={wedding}
        locations={locations}
        gallery={gallery}
        giftCards={giftCards}
        isOwner={isOwner}
        isPreview={isPreview}
        onFieldUpdate={onFieldUpdate}
        getFieldValue={getFieldValue}
        getFieldStyle={getFieldStyle}
        invitees={invitees}
        rsvpResponses={rsvpResponses}
        handleRsvpToggle={handleRsvpToggle}
        handleRsvpSubmit={handleRsvpSubmit}
        numberOfPersons={numberOfPersons}
        isRsvpDeadlinePassed={isRsvpDeadlinePassed}
        submittingRsvp={submittingRsvp}
      />
    );
  }

  if (template.component === 'EclatTemplate') {
    return (
      <EclatTemplate
        wedding={wedding}
        locations={locations}
        gallery={gallery}
        giftCards={giftCards}
        isOwner={isOwner}
        isPreview={isPreview}
        onFieldUpdate={onFieldUpdate}
        getFieldValue={getFieldValue}
        getFieldStyle={getFieldStyle}
        invitees={invitees}
        rsvpResponses={rsvpResponses}
        handleRsvpToggle={handleRsvpToggle}
        handleRsvpSubmit={handleRsvpSubmit}
        numberOfPersons={numberOfPersons}
        isRsvpDeadlinePassed={isRsvpDeadlinePassed}
        submittingRsvp={submittingRsvp}
      />
    );
  }

  if (template.component === 'AuraTemplate') {
    return (
      <AuraTemplate
        wedding={wedding}
        locations={locations}
        gallery={gallery}
        giftCards={giftCards}
        isOwner={isOwner}
        isPreview={isPreview}
        onFieldUpdate={onFieldUpdate}
        getFieldValue={getFieldValue}
        getFieldStyle={getFieldStyle}
        invitees={invitees}
        rsvpResponses={rsvpResponses}
        handleRsvpToggle={handleRsvpToggle}
        handleRsvpSubmit={handleRsvpSubmit}
        numberOfPersons={numberOfPersons}
        isRsvpDeadlinePassed={isRsvpDeadlinePassed}
        submittingRsvp={submittingRsvp}
      />
    );
  }

  if (template.component === 'OpulenceTemplate') {
    return (
      <OpulenceTemplate
        wedding={wedding}
        locations={locations}
        gallery={gallery}
        giftCards={giftCards}
        isOwner={isOwner}
        isPreview={isPreview}
        onFieldUpdate={onFieldUpdate}
        getFieldValue={getFieldValue}
        getFieldStyle={getFieldStyle}
        invitees={invitees}
        rsvpResponses={rsvpResponses}
        handleRsvpToggle={handleRsvpToggle}
        handleRsvpSubmit={handleRsvpSubmit}
        numberOfPersons={numberOfPersons}
        isRsvpDeadlinePassed={isRsvpDeadlinePassed}
        submittingRsvp={submittingRsvp}
      />
    );
  }

  if (template.component === 'LumiereTemplate') {
    return (
      <LumiereTemplate
        wedding={wedding}
        locations={locations}
        gallery={gallery}
        giftCards={giftCards}
        isOwner={isOwner}
        isPreview={isPreview}
        onFieldUpdate={onFieldUpdate}
        getFieldValue={getFieldValue}
        getFieldStyle={getFieldStyle}
        invitees={invitees}
        rsvpResponses={rsvpResponses}
        handleRsvpToggle={handleRsvpToggle}
        handleRsvpSubmit={handleRsvpSubmit}
        numberOfPersons={numberOfPersons}
        isRsvpDeadlinePassed={isRsvpDeadlinePassed}
        submittingRsvp={submittingRsvp}
      />
    );
  }

  if (template.component === 'EtoileTemplate') {
    return (
      <EtoileTemplate
        wedding={wedding}
        locations={locations}
        gallery={gallery}
        giftCards={giftCards}
        isOwner={isOwner}
        isPreview={isPreview}
        onFieldUpdate={onFieldUpdate}
        getFieldValue={getFieldValue}
        getFieldStyle={getFieldStyle}
        invitees={invitees}
        rsvpResponses={rsvpResponses}
        handleRsvpToggle={handleRsvpToggle}
        handleRsvpSubmit={handleRsvpSubmit}
        numberOfPersons={numberOfPersons}
        isRsvpDeadlinePassed={isRsvpDeadlinePassed}
        submittingRsvp={submittingRsvp}
      />
    );
  }

  if (template.component === 'TresorTemplate') {
    return (
      <TresorTemplate
        wedding={wedding}
        locations={locations}
        gallery={gallery}
        giftCards={giftCards}
        isOwner={isOwner}
        isPreview={isPreview}
        onFieldUpdate={onFieldUpdate}
        getFieldValue={getFieldValue}
        getFieldStyle={getFieldStyle}
        invitees={invitees}
        rsvpResponses={rsvpResponses}
        handleRsvpToggle={handleRsvpToggle}
        handleRsvpSubmit={handleRsvpSubmit}
        numberOfPersons={numberOfPersons}
        isRsvpDeadlinePassed={isRsvpDeadlinePassed}
        submittingRsvp={submittingRsvp}
      />
    );
  }

  // Sort sections by order
  const sortedSections = [...template.sections].sort((a, b) => a.order - b.order);
  
  // Extract ceremony and venue from locations
  const ceremony = locations.find(loc => loc.type === 'ceremony');
  const venue = locations.find(loc => loc.type === 'venue');
  const welcomeDrink = locations.find(loc => loc.type === 'welcome_drink');

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
                    welcomeDrinkTime={welcomeDrink?.time}
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
            <GiftCards giftCards={giftCards} isOwner={isOwner} />
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

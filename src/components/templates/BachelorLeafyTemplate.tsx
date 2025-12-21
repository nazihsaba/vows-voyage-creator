import { CountdownTimer } from '@/components/CountdownTimer';
import { EventLocation } from '@/components/EventLocation';
import { GiftCards } from '@/components/GiftCards';
import { EditableField } from '@/components/EditableField';
import { Calendar, Clock, MapPin } from 'lucide-react';
import bachelorBg from '@/assets/bachelor-leafy-template.png';

interface BachelorLeafyTemplateProps {
  wedding: any;
  locations: any[];
  gallery: any[];
  giftCards: any[];
  isOwner?: boolean;
  isPreview: boolean;
  onFieldUpdate: (fieldId: string, text: string, style: any) => void;
  getFieldValue: (fieldId: string, defaultValue: string) => string;
  getFieldStyle: (fieldId: string) => any;
}

export const BachelorLeafyTemplate = ({
  wedding,
  locations,
  giftCards,
  isOwner = false,
  isPreview,
  onFieldUpdate,
  getFieldValue,
  getFieldStyle,
}: BachelorLeafyTemplateProps) => {
  const ceremony = locations.find(loc => loc.type === 'ceremony');

  return (
    <div className="w-full min-h-screen bg-[#f5f1e8]">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16"
        style={{
          backgroundImage: wedding.main_picture_url ? `url(${wedding.main_picture_url})` : `url(${bachelorBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-3xl w-full text-center space-y-8 bg-white/90 backdrop-blur-sm p-12 rounded-lg shadow-2xl">
          {/* Main Heading */}
          <EditableField
            fieldId="main-heading"
            text={getFieldValue("main-heading", "ONE LAST PARTY WITH THE CREW...BEFORE THEY SAY 'I DO!'")}
            style={getFieldStyle("main-heading")}
            onUpdate={onFieldUpdate}
            isPreview={isPreview}
            tag="h1"
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
          />

          {/* Subtitle */}
          <EditableField
            fieldId="hero-subtitle"
            text={getFieldValue("hero-subtitle", "Join us to celebrate")}
            style={getFieldStyle("hero-subtitle")}
            onUpdate={onFieldUpdate}
            isPreview={isPreview}
            tag="p"
            className="text-xl md:text-2xl text-gray-700"
          />

          {/* Names */}
          <div className="py-6">
            <EditableField
              fieldId="names"
              text={getFieldValue("names", `${wedding.groom_name} & ${wedding.bride_name}`)}
              style={getFieldStyle("names")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="h2"
              className="text-5xl md:text-6xl lg:text-7xl text-gray-900"
            />
          </div>

          {/* Description */}
          <EditableField
            fieldId="description"
            text={getFieldValue("description", "with one unforgettable night of fun, friends, and questionable decisions.")}
            style={getFieldStyle("description")}
            onUpdate={onFieldUpdate}
            isPreview={isPreview}
            tag="p"
            className="text-lg md:text-xl text-gray-700 leading-relaxed"
          />

          {/* Event Details */}
          <div className="space-y-4 pt-6 text-left">
            {/* Date */}
            <div className="flex items-start gap-4">
              <Calendar className="w-6 h-6 text-gray-700 mt-1 flex-shrink-0" />
              <div>
                <p className="font-bold text-lg text-gray-900">Date:</p>
                <EditableField
                  fieldId="event-date"
                  text={getFieldValue("event-date", new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }))}
                  style={getFieldStyle("event-date")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="p"
                  className="text-lg text-gray-700"
                />
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-gray-700 mt-1 flex-shrink-0" />
              <div>
                <p className="font-bold text-lg text-gray-900">Time:</p>
                <EditableField
                  fieldId="event-time"
                  text={getFieldValue("event-time", ceremony?.time || "5:30 PM for Ladies and 8:00 PM for Gents")}
                  style={getFieldStyle("event-time")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="p"
                  className="text-lg text-gray-700"
                />
              </div>
            </div>

            {/* Location */}
            {ceremony && (
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-gray-700 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-bold text-lg text-gray-900">Location:</p>
                  <EditableField
                    fieldId="event-location"
                    text={getFieldValue("event-location", ceremony.location_name || "")}
                    style={getFieldStyle("event-location")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="p"
                    className="text-lg text-gray-700"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Message */}
          <div className="pt-8 border-t border-gray-300">
            <EditableField
              fieldId="footer-message"
              text={getFieldValue("footer-message", "Bring your party spirit; We'll take care of the rest.")}
              style={getFieldStyle("footer-message")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="p"
              className="text-xl md:text-2xl font-bold text-gray-900"
            />
          </div>
        </div>
      </section>

      {/* Location Details */}
      {locations.length > 0 && (
        <section className="py-16 px-6 bg-[#f5f1e8]">
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Event Location</h2>
            {locations.map((location) => (
              <EventLocation
                key={location.id}
                type={location.type}
                locationName={location.location_name}
                locationLink={location.location_link}
                time={location.time}
              />
            ))}
          </div>
        </section>
      )}

      {/* Gift Cards */}
      {giftCards && giftCards.length > 0 && (
        <GiftCards giftCards={giftCards} isOwner={isOwner} />
      )}
    </div>
  );
};

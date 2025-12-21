import { useState, useEffect, useRef } from "react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { EventLocation } from "@/components/EventLocation";
import { GiftCards } from "@/components/GiftCards";
import { EditableField } from "@/components/EditableField";
import { Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModernTemplateProps {
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

export const ModernTemplate = ({
  wedding,
  locations,
  gallery,
  giftCards,
  isOwner = false,
  isPreview,
  onFieldUpdate,
  getFieldValue,
  getFieldStyle,
}: ModernTemplateProps) => {
  const ceremony = locations.find((loc) => loc.type === "ceremony");
  const venue = locations.find((loc) => loc.type === "venue");

  return (
    <div className="w-full bg-white text-gray-900 font-sans">
      {/* Hero Section - Modern Full Width */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-4"
        style={{
          backgroundImage: wedding.main_picture_url
            ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${wedding.main_picture_url})`
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="relative z-10 space-y-4 sm:space-y-6 md:space-y-8 px-4 max-w-4xl">
          <div className="space-y-2 sm:space-y-4">
            <EditableField
              fieldId="groom-name"
              text={getFieldValue("groom-name", wedding.groom_name)}
              style={getFieldStyle("groom-name")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="h1"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white"
            />
            <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8">
              <div className="w-12 sm:w-16 md:w-24 h-0.5 bg-white"></div>
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white">&</p>
              <div className="w-12 sm:w-16 md:w-24 h-0.5 bg-white"></div>
            </div>
            <EditableField
              fieldId="bride-name"
              text={getFieldValue("bride-name", wedding.bride_name)}
              style={getFieldStyle("bride-name")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="h1"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white"
            />
          </div>

          <EditableField
            fieldId="wedding-date-display"
            text={getFieldValue(
              "wedding-date-display",
              new Date(wedding.wedding_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
            )}
            style={getFieldStyle("wedding-date-display")}
            onUpdate={onFieldUpdate}
            isPreview={isPreview}
            tag="p"
            className="text-sm sm:text-base md:text-lg text-white/90 tracking-widest uppercase"
          />
        </div>
      </section>

      {/* Family Names Section - Clean Layout */}
      <section className="py-12 sm:py-16 md:py-24 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 text-center">
            <div className="space-y-2 sm:space-y-4">
              <div className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">Groom's Family</div>
              <EditableField
                fieldId="groom-family"
                text={getFieldValue("groom-family", wedding.groom_family || "The Groom's Family")}
                style={getFieldStyle("groom-family")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="h2"
                className="text-xl sm:text-2xl md:text-3xl text-gray-900"
              />
            </div>

            <div className="space-y-2 sm:space-y-4">
              <div className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">Bride's Family</div>
              <EditableField
                fieldId="bride-family"
                text={getFieldValue("bride-family", wedding.bride_family || "The Bride's Family")}
                style={getFieldStyle("bride-family")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="h2"
                className="text-xl sm:text-2xl md:text-3xl text-gray-900"
              />
            </div>
          </div>

          <div className="mt-8 sm:mt-12 md:mt-16 max-w-2xl mx-auto text-center">
            <EditableField
              fieldId="invitation-text"
              text={getFieldValue(
                "invitation-text",
                "Together with their families, request the honor of your presence at the celebration of their marriage",
              )}
              style={getFieldStyle("invitation-text")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              multiline={true}
              tag="p"
              className="text-sm sm:text-base md:text-lg text-gray-700"
            />
          </div>
        </div>
      </section>

      {/* Photo Gallery Section - Grid Layout */}
      {gallery.length > 0 && (
        <section className="py-12 sm:py-16 md:py-24 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl text-center mb-8 sm:mb-12 md:mb-16 text-gray-900">Our Story</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {gallery.slice(0, 6).map((image, index) => (
                <div key={image.id} className={`overflow-hidden ${index === 0 ? "sm:col-span-2 sm:row-span-2" : ""}`}>
                  <img
                    src={image.image_url}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    style={{ minHeight: index === 0 ? "300px" : "150px" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Countdown Section - Minimalist */}
      <section className="py-12 sm:py-16 md:py-24 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl mb-6 sm:mb-8 md:mb-12 text-white">Counting The Days</h2>
          <CountdownTimer targetDate={wedding.wedding_date} />
        </div>
      </section>

      {/* Wedding Events Section - Card Layout */}
      <section className="py-12 sm:py-16 md:py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl mb-4 sm:mb-6 text-gray-900">Wedding Details</h2>
            <EditableField
              fieldId="events-subtitle"
              text={getFieldValue("events-subtitle", "Join us in celebrating this special day")}
              style={getFieldStyle("events-subtitle")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              multiline={true}
              tag="p"
              className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {ceremony && (
              <div className="bg-gray-50 p-6 sm:p-8 md:p-10 space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-gray-900" />
                  <h3 className="text-lg sm:text-xl md:text-2xl text-gray-900">Ceremony</h3>
                </div>
                <EventLocation
                  type="ceremony"
                  locationName={ceremony.location_name}
                  locationLink={ceremony.location_link}
                  time={ceremony.time}
                />
              </div>
            )}
            {venue && (
              <div className="bg-gray-50 p-6 sm:p-8 md:p-10 space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                  <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-gray-900" />
                  <h3 className="text-lg sm:text-xl md:text-2xl text-gray-900">Reception</h3>
                </div>
                <EventLocation
                  type="venue"
                  locationName={venue.location_name}
                  locationLink={venue.location_link}
                  time={venue.time}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Gift Cards Section */}
      {giftCards.length > 0 && (
        <section className="py-12 sm:py-16 md:py-24 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl text-center mb-8 sm:mb-12 text-gray-900">Gift Registry</h2>
            <GiftCards giftCards={giftCards} isOwner={isOwner} />
          </div>
        </section>
      )}

      {/* Closing Message - Modern Footer */}
      <section className="py-12 sm:py-16 md:py-24 px-4 bg-gray-900 text-white text-center">
        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
          <EditableField
            fieldId="closing-message"
            text={getFieldValue("closing-message", "We can't wait to celebrate with you!")}
            style={getFieldStyle("closing-message")}
            onUpdate={onFieldUpdate}
            isPreview={isPreview}
            multiline={true}
            tag="p"
            className="text-base sm:text-lg md:text-xl"
          />

          {wedding.rsvp_deadline && (
            <div className="pt-4 sm:pt-6 md:pt-8 border-t border-white/20">
              <p className="text-xs sm:text-sm text-white/70 mb-1 sm:mb-2">Kindly confirm your attendance before this date:</p>
              <p className="text-lg sm:text-xl md:text-2xl text-white">
                {new Date(wedding.rsvp_deadline).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

import { useState } from 'react';
import { EditableField } from '@/components/EditableField';
import { EventLocation } from '@/components/EventLocation';

interface ElegantTabsTemplateProps {
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

const SECTIONS = [
  { id: "invitation", label: "Invitation" },
  { id: "details", label: "Event Details" },
  { id: "location", label: "Location" },
  { id: "rsvp", label: "RSVP" },
];

export const ElegantTabsTemplate = ({
  wedding,
  locations,
  gallery,
  giftCards,
  isOwner = false,
  isPreview,
  onFieldUpdate,
  getFieldValue,
  getFieldStyle,
}: ElegantTabsTemplateProps) => {
  const [activeSection, setActiveSection] = useState("invitation");
  const ceremony = locations.find(loc => loc.type === 'ceremony');
  const venue = locations.find(loc => loc.type === 'venue');

  const renderSection = () => {
    switch (activeSection) {
      case "invitation":
        return (
          <div className="space-y-4 text-center md:text-left">
            <p className="text-sm tracking-[0.25em] uppercase text-rose-400">
              Wedding Invitation
            </p>
            <p className="text-lg text-slate-600">
              Together with their families,
            </p>
            <div className="text-xl md:text-2xl text-slate-700 space-x-2">
              <EditableField
                fieldId="groom-name"
                text={getFieldValue("groom-name", wedding.groom_name)}
                style={getFieldStyle("groom-name")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="span"
                className="font-semibold"
              />
              <span>&amp;</span>
              <EditableField
                fieldId="bride-name"
                text={getFieldValue("bride-name", wedding.bride_name)}
                style={getFieldStyle("bride-name")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="span"
                className="font-semibold"
              />
            </div>
            <EditableField
              fieldId="invitation-text-1"
              text={getFieldValue("invitation-text-1", "kindly request the pleasure of your company to celebrate their wedding.")}
              style={getFieldStyle("invitation-text-1")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              multiline={true}
              tag="p"
              className="text-slate-600"
            />
            <EditableField
              fieldId="invitation-text-2"
              text={getFieldValue("invitation-text-2", "Join us for an evening of love, joy, and celebration.")}
              style={getFieldStyle("invitation-text-2")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              multiline={true}
              tag="p"
              className="text-slate-600"
            />
          </div>
        );
      case "details":
        return (
          <div className="grid gap-6 md:grid-cols-2 text-slate-700">
            <div>
              <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-rose-400 mb-2">
                Ceremony
              </h3>
              {ceremony ? (
                <div className="space-y-2">
                  <EditableField
                    fieldId="ceremony-date"
                    text={getFieldValue("ceremony-date", new Date(wedding.wedding_date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }))}
                    style={getFieldStyle("ceremony-date")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="p"
                    className="font-medium"
                  />
                  <EditableField
                    fieldId="ceremony-time"
                    text={getFieldValue("ceremony-time", ceremony.time || "5:30 PM")}
                    style={getFieldStyle("ceremony-time")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="p"
                  />
                  <EditableField
                    fieldId="ceremony-note"
                    text={getFieldValue("ceremony-note", "Please arrive 20 minutes earlier to be seated.")}
                    style={getFieldStyle("ceremony-note")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    multiline={true}
                    tag="p"
                    className="mt-2 text-sm text-slate-500"
                  />
                </div>
              ) : (
                <p className="text-sm text-slate-500">No ceremony details available</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-rose-400 mb-2">
                Reception
              </h3>
              {venue ? (
                <div className="space-y-2">
                  <EditableField
                    fieldId="reception-timing"
                    text={getFieldValue("reception-timing", "Following the Ceremony")}
                    style={getFieldStyle("reception-timing")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="p"
                    className="font-medium"
                  />
                  <EditableField
                    fieldId="reception-time"
                    text={getFieldValue("reception-time", venue.time || "7:30 PM – Late")}
                    style={getFieldStyle("reception-time")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="p"
                  />
                  <EditableField
                    fieldId="reception-note"
                    text={getFieldValue("reception-note", "Dinner, music, and celebration to follow.")}
                    style={getFieldStyle("reception-note")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    multiline={true}
                    tag="p"
                    className="mt-2 text-sm text-slate-500"
                  />
                </div>
              ) : (
                <p className="text-sm text-slate-500">No reception details available</p>
              )}
            </div>
          </div>
        );
      case "location":
        return (
          <div className="space-y-4 text-slate-700">
            <div>
              <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-rose-400 mb-2">
                Venue
              </h3>
              {venue ? (
                <div className="space-y-2">
                  <EventLocation
                    type="venue"
                    locationName={venue.location_name}
                    locationLink={venue.location_link}
                    time={venue.time}
                  />
                  <EditableField
                    fieldId="venue-note"
                    text={getFieldValue("venue-note", "Exact address and directions will be provided with your final invitation.")}
                    style={getFieldStyle("venue-note")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    multiline={true}
                    tag="p"
                    className="mt-2 text-sm text-slate-500"
                  />
                </div>
              ) : (
                <p className="text-sm text-slate-500">No venue details available</p>
              )}
            </div>
            {venue?.location_link && (
              <div className="mt-4 h-48 rounded-2xl border border-rose-100 bg-slate-50 overflow-hidden">
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(venue.location_name)}&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>
        );
      case "rsvp":
        return (
          <div className="space-y-4 text-slate-700">
            {wedding.rsvp_deadline && (
              <EditableField
                fieldId="rsvp-deadline-text"
                text={getFieldValue("rsvp-deadline-text", `Kindly confirm your presence by ${new Date(wedding.rsvp_deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`)}
                style={getFieldStyle("rsvp-deadline-text")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                multiline={true}
                tag="p"
              />
            )}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="space-y-3 max-w-md"
            >
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-rose-100 bg-white/70 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Number of Guests
                </label>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-xl border border-rose-100 bg-white/70 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                  placeholder="e.g. 2"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Message (optional)
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-xl border border-rose-100 bg-white/70 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                  placeholder="Any notes or dietary preferences"
                />
              </div>
              <button
                type="submit"
                className="mt-2 inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium tracking-wide bg-rose-400 text-white shadow-md hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
              >
                Send RSVP
              </button>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf7f2] via-[#fdecee] to-[#f9d9df] flex items-center justify-center px-4 py-10">
      <div className="max-w-4xl w-full">
        {/* Card */}
        <div className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-md shadow-2xl border border-rose-100">
          {/* Decorative top border */}
          <div className="h-1 w-full bg-gradient-to-r from-rose-300 via-amber-200 to-rose-300" />

          {/* Top hero section */}
          <div className="px-6 pt-8 pb-6 md:px-10 md:pt-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="text-center md:text-left space-y-1">
                <p className="text-[0.7rem] tracking-[0.3em] uppercase text-rose-400">
                  The Wedding Of
                </p>
                <h1 className="text-3xl md:text-4xl font-light tracking-wide text-slate-800">
                  <EditableField
                    fieldId="hero-groom-name"
                    text={getFieldValue("hero-groom-name", wedding.groom_name)}
                    style={getFieldStyle("hero-groom-name")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="span"
                    className="font-semibold"
                  />
                  {" "}
                  <span className="text-rose-400">&amp;</span>
                  {" "}
                  <EditableField
                    fieldId="hero-bride-name"
                    text={getFieldValue("hero-bride-name", wedding.bride_name)}
                    style={getFieldStyle("hero-bride-name")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="span"
                    className="font-semibold"
                  />
                </h1>
                <p className="text-xs md:text-sm tracking-[0.18em] uppercase text-slate-400">
                  <EditableField
                    fieldId="hero-date-location"
                    text={getFieldValue("hero-date-location", `${new Date(wedding.wedding_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · ${venue?.location_name || 'Venue'}`)}
                    style={getFieldStyle("hero-date-location")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="span"
                  />
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 text-xs text-slate-500">
                <div className="px-4 py-2 rounded-full border border-rose-100 bg-white/60">
                  <span className="font-medium text-rose-400">Save the Date</span>
                </div>
                <p className="text-[0.7rem] uppercase tracking-[0.2em]">
                  You are invited
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="px-6 md:px-10">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-rose-100 to-transparent" />
          </div>

          {/* Tabs */}
          <div className="px-4 pt-4 md:px-8">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              {SECTIONS.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium tracking-wide transition
                    ${
                      isActive
                        ? "bg-rose-400 text-white shadow-sm"
                        : "bg-white/70 text-slate-500 border border-rose-100 hover:bg-white"
                    }`}
                  >
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-8 pt-5 md:px-10 md:pb-10">
            <div className="rounded-2xl border border-rose-50 bg-white/60 px-5 py-6 md:px-8 md:py-7">
              {renderSection()}
            </div>
          </div>

          {/* Bottom decorative border */}
          <div className="h-1 w-full bg-gradient-to-r from-rose-300 via-amber-200 to-rose-300" />
        </div>

        {/* Footer note */}
        <p className="mt-4 text-center text-[0.7rem] uppercase tracking-[0.25em] text-slate-400">
          With love · 
          <EditableField
            fieldId="footer-names"
            text={getFieldValue("footer-names", `${wedding.groom_name} & ${wedding.bride_name}`)}
            style={getFieldStyle("footer-names")}
            onUpdate={onFieldUpdate}
            isPreview={isPreview}
            tag="span"
            className="ml-1"
          />
        </p>
      </div>
    </div>
  );
};
import React, { useState } from "react";
import { format } from "date-fns";
import { CountdownTimer } from "@/components/CountdownTimer";
import { EventLocation } from "@/components/EventLocation";
import { EditableField } from "@/components/EditableField";
import { InlineEditableText } from "@/components/InlineEditableText";

interface ElegantTabsTemplateProps {
  wedding: any;
  locations?: any[];
  isPreview?: boolean;
  onFieldUpdate?: (fieldId: string, text: string, style: any) => void;
}

const SECTIONS = [
  { id: "invitation", label: "Invitation" },
  { id: "details", label: "Event Details" },
  { id: "location", label: "Location" },
  { id: "rsvp", label: "RSVP" },
];

export const ElegantTabsTemplate = ({ 
  wedding, 
  locations = [], 
  isPreview = false,
  onFieldUpdate 
}: ElegantTabsTemplateProps) => {
  const [activeSection, setActiveSection] = useState("invitation");

  const ceremonyLocation = locations.find(loc => loc.type === 'ceremony');
  const venueLocation = locations.find(loc => loc.type === 'venue');

  const weddingDate = new Date(wedding.wedding_date);
  const formattedDate = format(weddingDate, "EEEE, MMMM dd, yyyy");

  const renderSection = () => {
    switch (activeSection) {
      case "invitation":
        return (
          <div className="space-y-4 text-center md:text-left">
            <EditableField
              fieldId="event_title"
              text={wedding.event_title || "Wedding Invitation"}
              style={{ fontSize: "sm", color: "text-rose-400" }}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
            >
              <p className="text-sm tracking-[0.25em] uppercase text-rose-400">
                {wedding.event_title || "Wedding Invitation"}
              </p>
            </EditableField>

            <EditableField
              fieldId="welcoming_text"
              text={wedding.welcoming_text || "Together with their families,"}
              style={{ fontSize: "lg", color: "text-slate-600" }}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
            >
              <p className="text-lg text-slate-600">
                {wedding.welcoming_text || "Together with their families,"}
              </p>
            </EditableField>

            <p className="text-xl md:text-2xl text-slate-700">
              <span className="font-semibold">{wedding.groom_name}</span> &amp;{" "}
              <span className="font-semibold">{wedding.bride_name}</span>
            </p>

            <EditableField
              fieldId="main_description"
              text={wedding.main_description || "kindly request the pleasure of your company to celebrate their wedding."}
              style={{ fontSize: "base", color: "text-slate-600" }}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              multiline
            >
              <p className="text-slate-600">
                {wedding.main_description || "kindly request the pleasure of your company to celebrate their wedding."}
              </p>
            </EditableField>

            <EditableField
              fieldId="middle_text"
              text={wedding.middle_text || "Join us for an evening of love, joy, and celebration."}
              style={{ fontSize: "base", color: "text-slate-600" }}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
            >
              <p className="text-slate-600">
                {wedding.middle_text || "Join us for an evening of love, joy, and celebration."}
              </p>
            </EditableField>
          </div>
        );
      
      case "details":
        return (
          <div className="space-y-6">
            <CountdownTimer targetDate={weddingDate} />
            
            <div className="grid gap-6 md:grid-cols-2 text-slate-700">
              {ceremonyLocation && (
                <div>
                  <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-rose-400 mb-2">
                    Ceremony
                  </h3>
                  <p className="font-medium">{formattedDate}</p>
                  {ceremonyLocation.time && <p>{ceremonyLocation.time}</p>}
                  <p className="mt-2 text-sm text-slate-500">
                    Please arrive 20 minutes earlier to be seated.
                  </p>
                </div>
              )}
              
              {venueLocation && (
                <div>
                  <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-rose-400 mb-2">
                    Reception
                  </h3>
                  <p className="font-medium">Following the Ceremony</p>
                  {venueLocation.time && <p>{venueLocation.time}</p>}
                  <p className="mt-2 text-sm text-slate-500">
                    Dinner, music, and celebration to follow.
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      
      case "location":
        return (
          <div className="space-y-6">
            {ceremonyLocation && (
              <EventLocation
                type="ceremony"
                locationName={ceremonyLocation.location_name}
                locationLink={ceremonyLocation.location_link}
                time={ceremonyLocation.time}
              />
            )}
            
            {venueLocation && (
              <EventLocation
                type="venue"
                locationName={venueLocation.location_name}
                locationLink={venueLocation.location_link}
                time={venueLocation.time}
              />
            )}
          </div>
        );
      
      case "rsvp":
        return (
          <div className="space-y-4 text-slate-700">
            <EditableField
              fieldId="closing_message"
              text={wedding.closing_message || `Kindly confirm your presence by ${wedding.rsvp_deadline ? format(new Date(wedding.rsvp_deadline), "MMMM dd, yyyy") : "the RSVP deadline"}.`}
              style={{ fontSize: "base" }}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
            >
              <p>
                {wedding.closing_message || `Kindly confirm your presence by ${wedding.rsvp_deadline ? format(new Date(wedding.rsvp_deadline), "MMMM dd, yyyy") : "the RSVP deadline"}.`}
              </p>
            </EditableField>

            <div className="max-w-md space-y-4 text-center">
              <p className="text-sm text-slate-500">
                RSVP functionality will be available when you publish your invitation.
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf7f2] via-[#fdecee] to-[#f9d9df] flex items-center justify-center px-4 py-10">
      <div className="max-w-4xl w-full">
        <div className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-md shadow-2xl border border-rose-100">
          <div className="h-1 w-full bg-gradient-to-r from-rose-300 via-amber-200 to-rose-300" />

          <div className="px-6 pt-8 pb-6 md:px-10 md:pt-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="text-center md:text-left space-y-1">
                <p className="text-[0.7rem] tracking-[0.3em] uppercase text-rose-400">
                  The Wedding Of
                </p>
                <h1 className="text-3xl md:text-4xl font-light tracking-wide text-slate-800">
                  <span className="font-semibold">{wedding.groom_name}</span>{" "}
                  <span className="text-rose-400">&amp;</span>{" "}
                  <span className="font-semibold">{wedding.bride_name}</span>
                </h1>
                <p className="text-xs md:text-sm tracking-[0.18em] uppercase text-slate-400">
                  {formattedDate} · {venueLocation?.location_name || ceremonyLocation?.location_name || ""}
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

          <div className="px-6 md:px-10">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-rose-100 to-transparent" />
          </div>

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

          <div className="px-6 pb-8 pt-5 md:px-10 md:pb-10">
            <div className="rounded-2xl border border-rose-50 bg-white/60 px-5 py-6 md:px-8 md:py-7">
              {renderSection()}
            </div>
          </div>

          <div className="h-1 w-full bg-gradient-to-r from-rose-300 via-amber-200 to-rose-300" />
        </div>

        <p className="mt-4 text-center text-[0.7rem] uppercase tracking-[0.25em] text-slate-400">
          With love · {wedding.groom_name} &amp; {wedding.bride_name}
        </p>
      </div>
    </div>
  );
};

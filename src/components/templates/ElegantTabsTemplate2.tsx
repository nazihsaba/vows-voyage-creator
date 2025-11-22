import React, { useState } from "react";
import { format } from "date-fns";
import { CountdownTimer } from "@/components/CountdownTimer";
import { EventLocation } from "@/components/EventLocation";
import { EditableField } from "@/components/EditableField";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface ElegantTabsTemplate2Props {
  wedding: any;
  locations?: any[];
  isPreview?: boolean;
  onFieldUpdate?: (fieldId: string, text: string, style: any) => void;
  getFieldValue?: (fieldId: string, defaultValue: string) => string;
  getFieldStyle?: (fieldId: string) => any;
  invitees?: any[];
  rsvpResponses?: Record<string, boolean>;
  handleRsvpToggle?: (inviteeId: string, isAttending: boolean) => void;
  handleRsvpSubmit?: () => void;
  numberOfPersons?: number;
  isRsvpDeadlinePassed?: boolean;
  submittingRsvp?: boolean;
}

const SECTIONS = [
  { id: "invitation", label: "Invitation" },
  { id: "details", label: "Event Details" },
  { id: "location", label: "Location" },
  { id: "rsvp", label: "RSVP" },
];

export const ElegantTabsTemplate2 = ({ 
  wedding, 
  locations = [], 
  isPreview = false,
  onFieldUpdate,
  getFieldValue = (_, defaultValue) => defaultValue,
  getFieldStyle = () => ({}),
  invitees = [],
  rsvpResponses = {},
  handleRsvpToggle = () => {},
  handleRsvpSubmit = () => {},
  numberOfPersons = 0,
  isRsvpDeadlinePassed = false,
  submittingRsvp = false,
}: ElegantTabsTemplate2Props) => {
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
              text={getFieldValue("event_title", wedding.event_title || "Wedding Invitation")}
              style={getFieldStyle("event_title")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="p"
              className="text-sm tracking-[0.25em] uppercase text-rose-400"
            />

            <EditableField
              fieldId="welcoming_text"
              text={getFieldValue("welcoming_text", wedding.welcoming_text || "Together with their families,")}
              style={getFieldStyle("welcoming_text")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="p"
              className="text-lg text-slate-600"
            />

            <p className="text-xl md:text-2xl text-slate-700">
              <span className="font-semibold">{wedding.groom_name}</span> &amp;{" "}
              <span className="font-semibold">{wedding.bride_name}</span>
            </p>

            <EditableField
              fieldId="main_description"
              text={getFieldValue("main_description", wedding.main_description || "kindly request the pleasure of your company to celebrate their wedding.")}
              style={getFieldStyle("main_description")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              multiline
              tag="p"
              className="text-slate-600"
            />

            <EditableField
              fieldId="middle_text"
              text={getFieldValue("middle_text", wedding.middle_text || "Join us for an evening of love, joy, and celebration.")}
              style={getFieldStyle("middle_text")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="p"
              className="text-slate-600"
            />
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
              <div className="space-y-4 text-slate-700">
                <div>
                  <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-rose-400 mb-2">
                    Ceremony Venue
                  </h3>
                  <p className="font-medium">{ceremonyLocation.location_name}</p>
                  {ceremonyLocation.time && <p className="text-sm text-slate-500 mt-1">{ceremonyLocation.time}</p>}
                  {ceremonyLocation.location_link && (
                    <a
                      href={ceremonyLocation.location_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 text-sm text-rose-400 hover:text-rose-500 transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>View on Google Maps</span>
                    </a>
                  )}
                </div>
              </div>
            )}
            
            {venueLocation && (
              <div className="space-y-4 text-slate-700 pt-6 border-t border-rose-100">
                <div>
                  <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-rose-400 mb-2">
                    Reception Venue
                  </h3>
                  <p className="font-medium">{venueLocation.location_name}</p>
                  {venueLocation.time && <p className="text-sm text-slate-500 mt-1">{venueLocation.time}</p>}
                  {venueLocation.location_link && (
                    <a
                      href={venueLocation.location_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 text-sm text-rose-400 hover:text-rose-500 transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>View on Google Maps</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {!ceremonyLocation && !venueLocation && (
              <p className="text-sm text-slate-500">
                Exact address and directions will be provided with your final invitation.
              </p>
            )}
          </div>
        );
      
      case "rsvp":
        return (
          <div className="space-y-6 text-slate-700">
            {wedding.rsvp_deadline && (
              <EditableField
                fieldId="closing_message"
                text={getFieldValue(
                  "closing_message",
                  wedding.closing_message || `Kindly confirm your presence by ${format(new Date(wedding.rsvp_deadline), "MMMM dd, yyyy")}.`
                )}
                style={getFieldStyle("closing_message")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="p"
                className="text-slate-700"
              />
            )}

            {invitees.length > 0 ? (
              <div className="space-y-6">
                <p className="text-lg font-semibold text-center">This invitation is specially prepared for:</p>
                <div className="space-y-4">
                  {invitees.map((invitee: any) => (
                    <div
                      key={invitee.id}
                      className="flex items-center justify-between py-4 px-6 bg-rose-50/50 rounded-lg border border-rose-100 hover:bg-rose-50 transition-colors"
                    >
                      <span className="text-xl font-serif text-slate-700">{invitee.name}</span>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`rsvp-${invitee.id}`}
                          checked={rsvpResponses[invitee.id] === true}
                          onCheckedChange={(checked) => handleRsvpToggle(invitee.id, checked as boolean)}
                          disabled={isRsvpDeadlinePassed}
                          className="h-5 w-5"
                        />
                        <Label
                          htmlFor={`rsvp-${invitee.id}`}
                          className={`text-base cursor-pointer font-medium ${
                            isRsvpDeadlinePassed ? "text-muted-foreground" : "text-slate-700"
                          }`}
                        >
                          {rsvpResponses[invitee.id] === true ? "Attending ✓" : "Will Attend?"}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-rose-100 space-y-4">
                  <p className="text-lg font-semibold text-center">
                    Number of Guests: {numberOfPersons || invitees.length}
                  </p>

                  {isRsvpDeadlinePassed ? (
                    <p className="text-sm text-red-600 text-center font-medium">RSVP deadline has passed</p>
                  ) : (
                    <Button
                      onClick={handleRsvpSubmit}
                      disabled={submittingRsvp}
                      className="w-full text-lg py-6 bg-rose-400 hover:bg-rose-500 text-white rounded-full shadow-md"
                      size="lg"
                    >
                      {submittingRsvp ? "Submitting..." : "Send RSVP"}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-sm text-slate-500 py-6">
                <p>RSVP functionality will be available when you publish your invitation.</p>
              </div>
            )}
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
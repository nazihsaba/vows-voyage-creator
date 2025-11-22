import React, { useState } from "react";
import { format } from "date-fns";
import { EditableField } from "@/components/EditableField";
import { InlineEditableText } from "@/components/InlineEditableText";
import { CountdownTimer } from "@/components/CountdownTimer";
import { EventLocation } from "@/components/EventLocation";

const SECTIONS = [
  { id: "invitation", label: "Invitation" },
  { id: "details", label: "Event Details" },
  { id: "location", label: "Location" },
  { id: "rsvp", label: "RSVP" },
];

interface RoseGoldTabsTemplateProps {
  wedding: {
    id: string;
    groom_name: string;
    bride_name: string;
    wedding_date: string;
    rsvp_deadline?: string;
    invitation_text?: string;
    welcoming_text?: string;
    middle_text?: string;
    closing_message?: string;
  };
  locations?: Array<{
    id: string;
    type: string;
    location_name?: string;
    location_link?: string;
    time?: string;
  }>;
  invitees?: Array<{
    id: string;
    name: string;
    is_attending: boolean | null;
  }>;
  rsvpResponses?: Record<string, boolean>;
  isPreview?: boolean;
  onFieldUpdate?: (fieldId: string, text: string, style: any) => void;
  onRsvpToggle?: (inviteeId: string) => void;
  onRsvpSubmit?: () => void;
  numberOfPersons?: number;
  submittingRsvp?: boolean;
}

export default function RoseGoldTabsTemplate({
  wedding,
  locations = [],
  invitees = [],
  rsvpResponses = {},
  isPreview = false,
  onFieldUpdate,
  onRsvpToggle,
  onRsvpSubmit,
  numberOfPersons = 1,
  submittingRsvp = false,
}: RoseGoldTabsTemplateProps) {
  const [activeSection, setActiveSection] = useState("invitation");

  const weddingDate = new Date(wedding.wedding_date);
  const formattedDate = format(weddingDate, "EEEE, MMMM d, yyyy");
  const isRsvpDeadlinePassed = wedding.rsvp_deadline
    ? new Date() > new Date(wedding.rsvp_deadline)
    : false;

  const ceremonyLocation = locations.find((loc) => loc.type === "ceremony");
  const receptionLocation = locations.find((loc) => loc.type === "reception");

  const renderSection = () => {
    switch (activeSection) {
      case "invitation":
        return (
          <div className="space-y-4 text-center md:text-left">
            <p className="text-sm tracking-[0.25em] uppercase text-rose-400">
              Wedding Invitation
            </p>
            {isPreview ? (
              <>
                <EditableField
                  fieldId="welcoming_text"
                  text={wedding.welcoming_text || "Together with their families,"}
                  onUpdate={(fieldId, text) => onFieldUpdate?.(fieldId, text, {})}
                  className="text-lg text-slate-600"
                  isPreview={isPreview}
                />
                <p className="text-xl md:text-2xl text-slate-700">
                  <InlineEditableText
                    value={wedding.groom_name}
                    onChange={(value) => onFieldUpdate?.("groom_name", value, {})}
                    className="font-semibold"
                  />{" "}
                  &{" "}
                  <InlineEditableText
                    value={wedding.bride_name}
                    onChange={(value) => onFieldUpdate?.("bride_name", value, {})}
                    className="font-semibold"
                  />
                </p>
                <EditableField
                  fieldId="invitation_text"
                  text={
                    wedding.invitation_text ||
                    "kindly request the pleasure of your company to celebrate their wedding."
                  }
                  onUpdate={(fieldId, text) => onFieldUpdate?.(fieldId, text, {})}
                  className="text-slate-600"
                  isPreview={isPreview}
                />
                <EditableField
                  fieldId="middle_text"
                  text={wedding.middle_text || "Join us for an evening of love, joy, and celebration."}
                  onUpdate={(fieldId, text) => onFieldUpdate?.(fieldId, text, {})}
                  className="text-slate-600"
                  isPreview={isPreview}
                />
              </>
            ) : (
              <>
                <p className="text-lg text-slate-600">
                  {wedding.welcoming_text || "Together with their families,"}
                </p>
                <p className="text-xl md:text-2xl text-slate-700">
                  <span className="font-semibold">{wedding.groom_name}</span> &{" "}
                  <span className="font-semibold">{wedding.bride_name}</span>
                </p>
                <p className="text-slate-600">
                  {wedding.invitation_text ||
                    "kindly request the pleasure of your company to celebrate their wedding."}
                </p>
                <p className="text-slate-600">
                  {wedding.middle_text || "Join us for an evening of love, joy, and celebration."}
                </p>
              </>
            )}
          </div>
        );

      case "details":
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <CountdownTimer targetDate={weddingDate} />
            </div>
            <div className="grid gap-6 md:grid-cols-2 text-slate-700">
              <div>
                <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-rose-400 mb-2">
                  Ceremony
                </h3>
                <p className="font-medium">{formattedDate}</p>
                {ceremonyLocation?.time && <p>{ceremonyLocation.time}</p>}
                <p className="mt-2 text-sm text-slate-500">
                  Please arrive 20 minutes earlier to be seated.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-rose-400 mb-2">
                  Reception
                </h3>
                <p className="font-medium">Following the Ceremony</p>
                {receptionLocation?.time && <p>{receptionLocation.time}</p>}
                <p className="mt-2 text-sm text-slate-500">
                  Dinner, music, and celebration to follow.
                </p>
              </div>
            </div>
          </div>
        );

      case "location":
        return (
          <div className="space-y-4 text-slate-700">
            {locations.length > 0 ? (
              <div className="space-y-6">
                {locations.map((location) => (
                  <EventLocation
                    key={location.id}
                    type={location.type as "ceremony" | "venue"}
                    locationName={location.location_name}
                    locationLink={location.location_link}
                    time={location.time}
                  />
                ))}
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-rose-400 mb-2">
                  Venue
                </h3>
                <p className="font-medium">Wedding Venue</p>
                <p className="mt-2 text-sm text-slate-500">
                  Exact address and directions will be provided with your final invitation.
                </p>
                <div className="mt-4 h-48 rounded-2xl border border-rose-100 bg-slate-50 flex items-center justify-center text-sm text-slate-400">
                  Map / Location Preview
                </div>
              </div>
            )}
          </div>
        );

      case "rsvp":
        return (
          <div className="space-y-4 text-slate-700">
            {isRsvpDeadlinePassed ? (
              <p className="text-center text-slate-500">
                The RSVP deadline has passed. Please contact the couple directly if you have any
                questions.
              </p>
            ) : (
              <>
                <p>
                  Kindly confirm your presence by{" "}
                  <span className="font-semibold">
                    {wedding.rsvp_deadline
                      ? format(new Date(wedding.rsvp_deadline), "MMMM d, yyyy")
                      : "the specified date"}
                  </span>
                  .
                </p>
                {invitees.length > 0 ? (
                  <div className="space-y-3 max-w-md">
                    <p className="text-sm text-slate-600">
                      Please confirm attendance for {numberOfPersons}{" "}
                      {numberOfPersons === 1 ? "person" : "people"}:
                    </p>
                    {invitees.map((invitee) => (
                      <label
                        key={invitee.id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-rose-100 bg-white/70 cursor-pointer hover:bg-white transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={rsvpResponses[invitee.id] ?? invitee.is_attending ?? false}
                          onChange={() => onRsvpToggle?.(invitee.id)}
                          className="w-4 h-4 text-rose-400 border-rose-200 rounded focus:ring-rose-200"
                        />
                        <span className="text-sm font-medium text-slate-700">{invitee.name}</span>
                      </label>
                    ))}
                    <button
                      onClick={onRsvpSubmit}
                      disabled={submittingRsvp}
                      className="mt-2 inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium tracking-wide bg-rose-400 text-white shadow-md hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingRsvp ? "Sending..." : "Send RSVP"}
                    </button>
                  </div>
                ) : (
                  <p className="text-center text-slate-500">No RSVP information available.</p>
                )}
              </>
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
                  {isPreview ? (
                    <>
                      <InlineEditableText
                        value={wedding.groom_name}
                        onChange={(value) => onFieldUpdate?.("groom_name", value, {})}
                        className="font-semibold"
                      />{" "}
                      <span className="text-rose-400">&amp;</span>{" "}
                      <InlineEditableText
                        value={wedding.bride_name}
                        onChange={(value) => onFieldUpdate?.("bride_name", value, {})}
                        className="font-semibold"
                      />
                    </>
                  ) : (
                    <>
                      <span className="font-semibold">{wedding.groom_name}</span>{" "}
                      <span className="text-rose-400">&amp;</span>{" "}
                      <span className="font-semibold">{wedding.bride_name}</span>
                    </>
                  )}
                </h1>
                <p className="text-xs md:text-sm tracking-[0.18em] uppercase text-slate-400">
                  {formattedDate}
                  {ceremonyLocation?.location_name && ` · ${ceremonyLocation.location_name}`}
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 text-xs text-slate-500">
                <div className="px-4 py-2 rounded-full border border-rose-100 bg-white/60">
                  <span className="font-medium text-rose-400">Save the Date</span>
                </div>
                <p className="text-[0.7rem] uppercase tracking-[0.2em]">You are invited</p>
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
          With love · {wedding.groom_name} &amp; {wedding.bride_name}
        </p>
      </div>
    </div>
  );
}

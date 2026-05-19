import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { parseLocalDate } from "@/lib/weddingDate";
import { WishesSection } from "./WishesSection";
import { cn } from "@/lib/utils";


interface RsvpSectionProps {
  staticDeadline?: Date;
  wedding?: any;
  isPreview?: boolean;
  invitees?: any[];
  rsvpResponses?: Record<string, boolean | null | undefined>;
  handleRsvpToggle?: (inviteeId: string, isAttending: boolean | null) => void;
  handleRsvpSubmit?: (wishesMessage?: string) => void;
  numberOfPersons?: number;
  isRsvpDeadlinePassed?: boolean;
  submittingRsvp?: boolean;
  bgClassName?: string;
  cardBgClassName?: string;
  accentColorClass?: string;

}

export const RsvpSection = ({
  staticDeadline,
  wedding,
  isPreview = false,
  invitees = [],
  rsvpResponses = {},
  handleRsvpToggle = () => {},
  handleRsvpSubmit = () => {},
  numberOfPersons = 0,
  isRsvpDeadlinePassed = false,
  submittingRsvp = false,
  bgClassName = "bg-white",
  cardBgClassName = "bg-[#faf8f5]",
  accentColorClass = "text-primary",
}: RsvpSectionProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const rsvpDeadline = staticDeadline || (wedding?.rsvp_deadline ? parseLocalDate(wedding.rsvp_deadline) : null);
  const dateLocale = isArabic ? "ar-SA-u-ca-gregory" : "en-US";
  const wishesEnabled = !!wedding?.wishes_enabled;
  // Show wishes in live invites only when enabled; always show in previews
  const showWishes = (wishesEnabled || isPreview) && !isRsvpDeadlinePassed;
  const [wishesMessage, setWishesMessage] = useState("");


  return (
    <AnimatedSection animation="fade-up">
      <section className={`py-16 px-4 ${bgClassName}`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-template-subtitle text-center mb-12 ${accentColorClass}`}>{t("rsvp.title")}</h2>
            <p className="text-center text-template-body mb-8 text-muted-foreground">{t("rsvp.subtitle")}</p>
          </div>

          {invitees.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-gray-300">
              <div className="space-y-4">
                {invitees.map((invitee: any) => {
                  const response = rsvpResponses[invitee.id];
                  const isAttending = response === true;
                  const isNotAttending = response === false;
                  const disabled = isRsvpDeadlinePassed;
                  const baseBtn =
                    "flex-1 sm:flex-initial px-4 py-2 rounded-md text-sm font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
                  const accentBg =
                    accentColorClass === "text-black" ? "bg-black text-white border-black" : "bg-primary text-white border-primary";
                  return (
                    <div
                      key={invitee.id}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4 px-6 ${cardBgClassName} rounded-lg border border-gray-200`}
                    >
                      <span className={`text-xl font-serif ${accentColorClass}`}>{invitee.name}</span>
                      <div className="flex items-center gap-2" role="group" aria-label={`RSVP for ${invitee.name}`}>
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => handleRsvpToggle(invitee.id, isAttending ? null : true)}
                          aria-pressed={isAttending}
                          className={cn(baseBtn, isAttending ? accentBg : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50")}
                        >
                          {t("rsvp.attending")}
                        </button>
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => handleRsvpToggle(invitee.id, isNotAttending ? null : false)}
                          aria-pressed={isNotAttending}
                          className={cn(baseBtn, isNotAttending ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50")}
                        >
                          {t("rsvp.notAttending")}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="pt-6 border-t border-gray-300 space-y-4">
                <p className="text-lg font-semibold text-center text-[#3e2723]">
                  {t("rsvp.numberOfGuests", { count: numberOfPersons || invitees.length })}
                </p>
                {showWishes && (
                  <WishesSection value={wishesMessage} onChange={setWishesMessage} idSuffix="inline" />
                )}
                {isRsvpDeadlinePassed ? (
                  <p className="text-sm text-red-600 text-center font-medium">{t("rsvp.deadlinePassed")}</p>
                ) : (
                  <Button
                    onClick={() => handleRsvpSubmit(showWishes ? wishesMessage.trim() : undefined)}
                    disabled={submittingRsvp}
                    className={`w-full text-lg py-6 ${accentColorClass === "text-black" ? "bg-black hover:bg-black/90" : "bg-primary hover:bg-primary/90"} text-white`}
                    size="lg"
                  >
                    {submittingRsvp ? t("rsvp.submitting") : t("rsvp.submit")}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Standalone wishes block when no invitee link is opened (e.g. shared bare invite or preview) */}
          {showWishes && invitees.length === 0 && (
            <div className="space-y-8 pt-10 border-t border-gray-300">
              <WishesSection value={wishesMessage} onChange={setWishesMessage} idSuffix="standalone" />
              <Button
                onClick={() => handleRsvpSubmit(wishesMessage.trim())}
                disabled={submittingRsvp || !wishesMessage.trim()}
                className={`w-full text-lg py-6 ${accentColorClass === "text-black" ? "bg-black hover:bg-black/90" : "bg-primary hover:bg-primary/90"} text-white`}
                size="lg"
              >
                {submittingRsvp ? t("rsvp.submitting") : t("rsvp.sendWishes")}
              </Button>
            </div>
          )}

          {rsvpDeadline && (
            <div className="pt-8 border-t border-gray-300">
              <p className="text-template-small text-center mb-2 text-gray-600">
                {invitees.length > 0 ? t("rsvp.rsvpBy") : t("rsvp.confirmBefore")}
              </p>
              <p className={`text-template-heading ${accentColorClass} text-center`}>
                {rsvpDeadline.toLocaleDateString(dateLocale, { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          )}

        </div>
      </section>
    </AnimatedSection>
  );
};

export default RsvpSection;

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { parseLocalDate } from "@/lib/weddingDate";


interface RsvpSectionProps {
  staticDeadline?: Date;
  wedding?: any;
  isPreview?: boolean;
  invitees?: any[];
  rsvpResponses?: Record<string, boolean>;
  handleRsvpToggle?: (inviteeId: string, isAttending: boolean) => void;
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
                {invitees.map((invitee: any) => (
                  <div
                    key={invitee.id}
                    className={`flex items-center justify-between py-4 px-6 ${cardBgClassName} rounded-lg border border-gray-200 hover:bg-[#f5f0e8] transition-colors`}
                  >
                    <span className={`text-xl font-serif ${accentColorClass}`}>{invitee.name}</span>
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
                        className={`text-base cursor-pointer font-medium ${isRsvpDeadlinePassed ? "text-gray-400" : "text-[#3e2723]"}`}
                      >
                        {rsvpResponses[invitee.id] === true ? t("rsvp.attending") : t("rsvp.willAttend")}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t border-gray-300 space-y-4">
                <p className="text-lg font-semibold text-center text-[#3e2723]">
                  {t("rsvp.numberOfGuests", { count: numberOfPersons || invitees.length })}
                </p>
                {wishesEnabled && !isRsvpDeadlinePassed && (
                  <div className="py-12">
                  <div className="relative rounded-xl border border-gray-200 bg-white px-6 py-10">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white border border-gray-200 whitespace-nowrap max-w-[calc(100%-2rem)]">
                      <Label
                        htmlFor="wishes-message"
                        className="text-[11px] uppercase tracking-[0.18em] text-gray-600 font-medium"
                        style={{ fontFamily: "var(--font-template-body)" }}
                      >
                        {t("rsvp.wishesTitle")}
                      </Label>
                    </div>
                    <Textarea
                      id="wishes-message"
                      value={wishesMessage}
                      onChange={(e) => setWishesMessage(e.target.value.slice(0, 1000))}
                      placeholder={t("rsvp.wishesPlaceholder")}
                      rows={4}
                      maxLength={1000}
                      style={{ fontFamily: "var(--font-template-body)" }}
                      className="resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:[font-family:var(--font-template-body)] placeholder:italic text-[#3e2723] p-0"
                    />
                    <div className="flex justify-end mt-2">
                      <span className="text-[11px] text-gray-500 tabular-nums">{wishesMessage.length}/1000</span>
                    </div>
                  </div>
                  </div>
                )}
                {isRsvpDeadlinePassed ? (
                  <p className="text-sm text-red-600 text-center font-medium">{t("rsvp.deadlinePassed")}</p>
                ) : (
                  <Button
                    onClick={() => handleRsvpSubmit(wishesEnabled ? wishesMessage.trim() : undefined)}
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
          {wishesEnabled && invitees.length === 0 && !isRsvpDeadlinePassed && (
            <div className="space-y-8 pt-10 border-t border-gray-300">
              <div className="relative rounded-xl border border-gray-200 bg-white px-6 py-10">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white border border-gray-200 whitespace-nowrap max-w-[calc(100%-2rem)]">
                  <Label
                    htmlFor="wishes-message-standalone"
                    className="text-[11px] uppercase tracking-[0.18em] text-gray-600 font-medium"
                    style={{ fontFamily: "var(--font-template-body)" }}
                  >
                    {t("rsvp.wishesTitle")}
                  </Label>
                </div>
                <Textarea
                  id="wishes-message-standalone"
                  value={wishesMessage}
                  onChange={(e) => setWishesMessage(e.target.value.slice(0, 1000))}
                  placeholder={t("rsvp.wishesPlaceholder")}
                  rows={4}
                  maxLength={1000}
                  style={{ fontFamily: "var(--font-template-body)" }}
                  className="resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:[font-family:var(--font-template-body)] placeholder:italic text-[#3e2723] p-0"
                />
                <div className="flex justify-end mt-2">
                  <span className="text-[11px] text-gray-500 tabular-nums">{wishesMessage.length}/1000</span>
                </div>
              </div>
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

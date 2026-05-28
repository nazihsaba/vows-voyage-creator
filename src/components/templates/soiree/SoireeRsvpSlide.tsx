import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Check, X } from "lucide-react";
import { parseLocalDate } from "@/lib/weddingDate";

interface SoireeRsvpSlideProps {
  wedding: any;
  invitees?: any[];
  rsvpResponses?: Record<string, boolean | null | undefined>;
  handleRsvpToggle?: (inviteeId: string, isAttending: boolean | null) => void;
  handleRsvpSubmit?: (wishesMessage?: string) => void;
  numberOfPersons?: number;
  isRsvpDeadlinePassed?: boolean;
  submittingRsvp?: boolean;
  isPreview?: boolean;
  backgroundImage?: string;
}

const GOLD = "#d4af6c";
const GOLD_DEEP = "#b8862f";

/**
 * Soirée RSVP slide — matches the editorial cinematic aesthetic of the rest
 * of the Soirée template: dark image backdrop, italic serif typography,
 * gold ornamental accents, and Embla-friendly soft fade-up motion.
 */
export const SoireeRsvpSlide = ({
  wedding,
  invitees = [],
  rsvpResponses = {},
  handleRsvpToggle = () => {},
  handleRsvpSubmit = () => {},
  numberOfPersons = 0,
  isRsvpDeadlinePassed = false,
  submittingRsvp = false,
  isPreview = false,
  backgroundImage,
}: SoireeRsvpSlideProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const dateLocale = isArabic ? "ar-SA-u-ca-gregory" : "en-US";

  const wishesEnabled = !!wedding?.wishes_enabled;
  const showWishes = (wishesEnabled || isPreview) && !isRsvpDeadlinePassed;
  const [wishesMessage, setWishesMessage] = useState("");

  const rsvpDeadline = wedding?.rsvp_deadline ? parseLocalDate(wedding.rsvp_deadline) : null;

  const hasInvitees = invitees.length > 0;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
      {/* Backdrop */}
      {backgroundImage ? (
        <motion.img
          src={backgroundImage}
          alt=""
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 6, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.45 }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-[#3a3a3a]" />
      )}
      <div className="absolute inset-0 bg-black/55 pointer-events-none" />
      {/* Soft warm vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(212,175,108,0.18) 0%, rgba(212,175,108,0.04) 40%, transparent 70%)",
        }}
      />

      {/* Ornamental sprigs */}
      <Sprig className="absolute top-5 left-5 w-20 h-14 md:w-28 md:h-20" delay={0.2} />
      <Sprig
        className="absolute bottom-5 right-5 w-20 h-14 md:w-28 md:h-20"
        delay={0.5}
        flip
      />

      {/* Scrollable content */}
      <div className="relative h-full w-full overflow-y-auto overscroll-contain">
        <div className="min-h-full flex flex-col items-center justify-center px-6 md:px-14 py-14 text-white">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.9 }}
            className="text-[10px] md:text-xs tracking-[0.5em] uppercase text-white/80"
          >
            {t("rsvp.title", "Join Our Celebration")}
          </motion.p>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="mt-4 text-4xl md:text-5xl italic font-light tracking-wide text-center"
          >
            {hasInvitees ? t("rsvp.willAttend", "Will You Attend?") : t("rsvp.sendWishes", "Send Your Wishes")}
          </motion.h2>

          {/* Thin underline */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 56 }}
            transition={{ delay: 0.95, duration: 0.8 }}
            className="h-[1px] bg-white/70 mt-5"
          />

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="mt-5 text-xs md:text-sm tracking-wider text-white/75 text-center max-w-md leading-relaxed"
          >
            {t(
              "rsvp.subtitle",
              "Please let us know if you can join us on our special day. Your presence would mean the world to us.",
            )}
          </motion.p>

          {/* Invitee cards */}
          {hasInvitees && (
            <div className="mt-8 w-full max-w-md grid gap-3">
              {invitees.map((invitee: any, index: number) => {
                const response = rsvpResponses[invitee.id];
                const isAttending = response === true;
                const isNotAttending = response === false;
                const disabled = isRsvpDeadlinePassed;
                return (
                  <motion.div
                    key={invitee.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.7 }}
                    className="relative w-full bg-white/95 text-[#1a1a1a] rounded-xl px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] tracking-[0.35em] uppercase text-[#6b6b6b]">
                          {t("rsvp.willAttend", "Will Attend?")}
                        </p>
                        <p className="mt-1.5 text-lg md:text-xl font-light italic tracking-wide truncate">
                          {invitee.name}
                        </p>
                      </div>
                      <div
                        className="flex items-center gap-2 shrink-0"
                        role="group"
                        aria-label={`RSVP for ${invitee.name}`}
                      >
                        <ChoicePill
                          active={isAttending}
                          disabled={disabled}
                          onClick={() => handleRsvpToggle(invitee.id, isAttending ? null : true)}
                          variant="yes"
                          label={t("rsvp.attending", "Attending")}
                        />
                        <ChoicePill
                          active={isNotAttending}
                          disabled={disabled}
                          onClick={() => handleRsvpToggle(invitee.id, isNotAttending ? null : false)}
                          variant="no"
                          label={t("rsvp.notAttending", "Not Attending")}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Guest count */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="mt-2 text-center text-sm italic text-white/85"
              >
                {t("rsvp.numberOfGuests", { count: numberOfPersons || invitees.length })}
              </motion.p>
            </div>
          )}

          {/* Wishes */}
          {showWishes && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-6 w-full max-w-md"
            >
              <div className="relative rounded-xl border border-white/25 bg-white/10 backdrop-blur-md px-5 py-6">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 border border-white/20 whitespace-nowrap">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-white/85">
                    {t("rsvp.wishesTitle", "Share Your Love & Wishes")}
                  </span>
                </div>
                <textarea
                  value={wishesMessage}
                  onChange={(e) => setWishesMessage(e.target.value.slice(0, 1000))}
                  placeholder={t("rsvp.wishesPlaceholder", "Leave a heartfelt note for the couple ...")}
                  rows={4}
                  maxLength={1000}
                  className="w-full resize-none bg-transparent text-white placeholder:text-white/55 placeholder:italic focus:outline-none text-sm leading-relaxed"
                />
                <div className="flex justify-end -mt-1">
                  <span className="text-[10px] text-white/55 tabular-nums">
                    {wishesMessage.length}/1000
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Submit / deadline state */}
          {(hasInvitees || showWishes) && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-6 w-full max-w-md"
            >
              {isRsvpDeadlinePassed ? (
                <p
                  className="text-center text-xs tracking-[0.3em] uppercase py-3"
                  style={{ color: GOLD }}
                >
                  {t("rsvp.deadlinePassed", "RSVP deadline has passed")}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    handleRsvpSubmit(showWishes ? wishesMessage.trim() : undefined)
                  }
                  disabled={
                    submittingRsvp ||
                    (!hasInvitees && showWishes && !wishesMessage.trim())
                  }
                  className="group relative w-full overflow-hidden rounded-full border border-white/70 bg-white/95 hover:bg-white text-[#1a1a1a] tracking-[0.35em] uppercase text-[11px] py-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span
                    className="absolute inset-y-0 left-0 w-1"
                    style={{ background: GOLD }}
                  />
                  <span
                    className="absolute inset-y-0 right-0 w-1"
                    style={{ background: GOLD }}
                  />
                  {submittingRsvp
                    ? t("rsvp.submitting", "Submitting...")
                    : t("rsvp.submit", "Submit RSVP")}
                </button>
              )}
            </motion.div>
          )}

          {/* Deadline date */}
          {rsvpDeadline && !isNaN(rsvpDeadline.getTime()) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="mt-10 flex flex-col items-center"
            >
              <span className="text-[10px] tracking-[0.5em] uppercase text-white/65">
                {hasInvitees
                  ? t("rsvp.rsvpBy", "Please RSVP by:")
                  : t("rsvp.confirmBefore", "Kindly confirm your attendance before this date:")}
              </span>
              <span
                className="mt-3 h-[1px] w-8"
                style={{ background: GOLD }}
              />
              <p className="mt-3 text-xl md:text-2xl italic font-light text-white">
                {rsvpDeadline.toLocaleDateString(dateLocale, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------- Helpers ---------- */

const ChoicePill = ({
  active,
  disabled,
  onClick,
  variant,
  label,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  variant: "yes" | "no";
  label: string;
}) => {
  const Icon = variant === "yes" ? Check : X;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={label}
      className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? "text-white shadow-[0_4px_14px_rgba(0,0,0,0.25)]"
          : "text-[#1a1a1a]/60 hover:text-[#1a1a1a] border border-[#1a1a1a]/15 hover:border-[#1a1a1a]/35"
      }`}
      style={
        active
          ? {
              background: variant === "yes" ? GOLD_DEEP : "#1a1a1a",
            }
          : undefined
      }
    >
      <Icon className="w-4 h-4" strokeWidth={2} />
    </button>
  );
};

const Sprig = ({
  className,
  delay = 0,
  flip = false,
}: {
  className?: string;
  delay?: number;
  flip?: boolean;
}) => (
  <motion.svg
    viewBox="0 0 120 80"
    className={className}
    style={flip ? { transform: "scale(-1, -1)" } : undefined}
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 1.6, delay, ease: "easeOut" }}
  >
    <motion.path
      d="M5 70 Q 30 60, 50 40 T 110 10"
      fill="none"
      stroke={GOLD_DEEP}
      strokeWidth="0.8"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2.2, delay, ease: "easeInOut" }}
    />
    {[
      { cx: 25, cy: 62, r: 2.2 },
      { cx: 45, cy: 46, r: 1.8 },
      { cx: 70, cy: 30, r: 2 },
      { cx: 95, cy: 16, r: 1.6 },
    ].map((leaf, idx) => (
      <motion.ellipse
        key={idx}
        cx={leaf.cx}
        cy={leaf.cy}
        rx={leaf.r * 2.2}
        ry={leaf.r}
        fill={GOLD}
        opacity="0.6"
        transform={`rotate(${-30 + idx * 8} ${leaf.cx} ${leaf.cy})`}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ duration: 0.6, delay: delay + 1 + idx * 0.12 }}
      />
    ))}
  </motion.svg>
);

export default SoireeRsvpSlide;

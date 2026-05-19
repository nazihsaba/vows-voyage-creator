import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface WishesSectionProps {
  value: string;
  onChange: (value: string) => void;
  idSuffix?: string;
  maxLength?: number;
}

/**
 * Reusable "Share Your Love & Wishes" component.
 * Visibility is controlled by the parent (RsvpSection):
 * - Shown in live templates only when wishes_enabled is true for the event
 * - Always shown in preview mode so users can see the full RSVP experience
 */
export const WishesSection = ({
  value,
  onChange,
  idSuffix = "",
  maxLength = 1000,
}: WishesSectionProps) => {
  const { t } = useTranslation();
  const id = `wishes-message${idSuffix ? `-${idSuffix}` : ""}`;

  return (
    <div className="py-12">
      <div className="relative rounded-xl border border-gray-200 bg-white px-6 py-10">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white border border-gray-200 whitespace-nowrap max-w-[calc(100%-2rem)]">
          <Label
            htmlFor={id}
            className="text-[11px] uppercase tracking-[0.18em] text-gray-600 font-medium"
            style={{ fontFamily: "var(--font-template-body)" }}
          >
            {t("rsvp.wishesTitle")}
          </Label>
        </div>
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder={t("rsvp.wishesPlaceholder")}
          rows={4}
          maxLength={maxLength}
          style={{ fontFamily: "var(--font-template-body)" }}
          className="resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:[font-family:var(--font-template-body)] placeholder:italic text-[#3e2723] p-0"
        />
        <div className="flex justify-end mt-2">
          <span className="text-[11px] text-gray-500 tabular-nums">
            {value.length}/{maxLength}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WishesSection;

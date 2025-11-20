import { useState } from "react";
import { EditableField } from "@/components/EditableField";
import { CountdownTimer } from "@/components/CountdownTimer";

interface ElegantMonogramTemplateProps {
  wedding: any;
  onFieldUpdate?: (fieldId: string, text: string, style: any) => void;
  isPreview?: boolean;
}

const ElegantMonogramTemplate = ({
  wedding,
  onFieldUpdate,
  isPreview = false,
}: ElegantMonogramTemplateProps) => {
  const [showContent, setShowContent] = useState(false);

  const getFieldValue = (fieldId: string, defaultValue: string) => {
    if (wedding.field_customizations?.[fieldId]) {
      return wedding.field_customizations[fieldId].text || defaultValue;
    }
    return defaultValue;
  };

  const getFieldStyle = (fieldId: string) => {
    return wedding.field_customizations?.[fieldId]?.style || {};
  };

  const getMonogram = () => {
    const groomInitial = wedding.groom_name?.charAt(0) || "G";
    const brideInitial = wedding.bride_name?.charAt(0) || "B";
    return `${groomInitial}♡${brideInitial}`;
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${wedding.main_picture_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920'})`,
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Main Content */}
      {!showContent ? (
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-white">
          {/* Logo/Monogram */}
          <div className="mb-12">
            <EditableField
              fieldId="monogram"
              text={getFieldValue("monogram", getMonogram())}
              style={{
                fontSize: "120px",
                fontFamily: "Playfair Display",
                fontWeight: "400",
                color: "#ffffff",
                ...getFieldStyle("monogram"),
              }}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
            />
          </div>

          {/* Countdown Timer */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-8">
              {(() => {
                const now = new Date();
                const target = new Date(wedding.wedding_date);
                const days = Math.max(0, Math.floor((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
                const hours = Math.max(0, Math.floor(((target.getTime() - now.getTime()) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
                const minutes = Math.max(0, Math.floor(((target.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60)));
                const seconds = Math.max(0, Math.floor(((target.getTime() - now.getTime()) % (1000 * 60)) / 1000));
                
                return (
                  <>
                    <div className="flex flex-col items-center">
                      <div className="text-5xl font-light italic mb-2" style={{ color: "#ffffff" }}>{days}</div>
                      <div className="text-sm uppercase tracking-widest" style={{ color: "#ffffff" }}>DAYS</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-5xl font-light italic mb-2" style={{ color: "#ffffff" }}>{hours}</div>
                      <div className="text-sm uppercase tracking-widest" style={{ color: "#ffffff" }}>HOURS</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-5xl font-light italic mb-2" style={{ color: "#ffffff" }}>{minutes}</div>
                      <div className="text-sm uppercase tracking-widest" style={{ color: "#ffffff" }}>MINUTES</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-5xl font-light italic mb-2" style={{ color: "#ffffff" }}>{seconds}</div>
                      <div className="text-sm uppercase tracking-widest" style={{ color: "#ffffff" }}>SECONDS</div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={() => setShowContent(true)}
            className="rounded-md border-2 border-white px-12 py-3 text-lg font-light uppercase tracking-wider text-white transition-all hover:bg-white hover:text-black"
          >
            Start
          </button>
        </div>
      ) : (
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16 text-white">
          <div className="w-full max-w-2xl space-y-12 text-center">
            {/* Welcome Message */}
            <div className="space-y-4">
              <EditableField
                fieldId="welcome-message"
                text={getFieldValue("welcome-message", "Together with their families")}
                style={{
                  fontSize: "18px",
                  fontFamily: "Inter",
                  fontWeight: "300",
                  color: "#ffffff",
                  ...getFieldStyle("welcome-message"),
                }}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
              />
            </div>

            {/* Bride and Groom Names */}
            <div className="space-y-2">
              <EditableField
                fieldId="bride-name"
                text={getFieldValue("bride-name", wedding.bride_name || "Bride Name")}
                style={{
                  fontSize: "64px",
                  fontFamily: "Playfair Display",
                  fontWeight: "400",
                  color: "#ffffff",
                  ...getFieldStyle("bride-name"),
                }}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
              />
              <div className="text-3xl font-light">&</div>
              <EditableField
                fieldId="groom-name"
                text={getFieldValue("groom-name", wedding.groom_name || "Groom Name")}
                style={{
                  fontSize: "64px",
                  fontFamily: "Playfair Display",
                  fontWeight: "400",
                  color: "#ffffff",
                  ...getFieldStyle("groom-name"),
                }}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
              />
            </div>

            {/* Invitation Text */}
            <div className="space-y-4">
              <EditableField
                fieldId="invitation-text"
                text={getFieldValue(
                  "invitation-text",
                  "Request the honor of your presence at their wedding celebration"
                )}
                style={{
                  fontSize: "18px",
                  fontFamily: "Inter",
                  fontWeight: "300",
                  color: "#ffffff",
                  ...getFieldStyle("invitation-text"),
                }}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                multiline
              />
            </div>

            {/* Wedding Date */}
            <div className="space-y-2">
              <EditableField
                fieldId="wedding-date-display"
                text={getFieldValue(
                  "wedding-date-display",
                  new Date(wedding.wedding_date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                )}
                style={{
                  fontSize: "24px",
                  fontFamily: "Playfair Display",
                  fontWeight: "400",
                  color: "#ffffff",
                  ...getFieldStyle("wedding-date-display"),
                }}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
              />
            </div>

            {/* Additional Details */}
            <div className="space-y-4 pt-8">
              <EditableField
                fieldId="additional-details"
                text={getFieldValue(
                  "additional-details",
                  wedding.main_description || "Join us for a celebration of love"
                )}
                style={{
                  fontSize: "16px",
                  fontFamily: "Inter",
                  fontWeight: "300",
                  color: "#ffffff",
                  ...getFieldStyle("additional-details"),
                }}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                multiline
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElegantMonogramTemplate;

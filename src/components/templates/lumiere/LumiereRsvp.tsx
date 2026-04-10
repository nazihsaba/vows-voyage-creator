import { RsvpSection } from "@/components/templates/RsvpSection";
import LumiereTornCard, { TornCardVariant } from "./LumiereTornCard";

interface LumiereRsvpProps {
  wedding: any;
  isPreview: boolean;
  invitees?: any[];
  rsvpResponses?: Record<string, boolean>;
  handleRsvpToggle?: (inviteeId: string, isAttending: boolean) => void;
  handleRsvpSubmit?: () => void;
  numberOfPersons?: number;
  isRsvpDeadlinePassed?: boolean;
  submittingRsvp?: boolean;
  staticDeadline?: Date;
  cardVariant?: TornCardVariant;
}

const LumiereRsvp = ({
  wedding,
  isPreview,
  invitees = [],
  rsvpResponses = {},
  handleRsvpToggle = () => {},
  handleRsvpSubmit = () => {},
  numberOfPersons = 0,
  isRsvpDeadlinePassed = false,
  submittingRsvp = false,
  staticDeadline,
  cardVariant = "solid",
}: LumiereRsvpProps) => {
  const isGlass = cardVariant === "glass";

  return (
    <LumiereTornCard variant={cardVariant}>
      <RsvpSection
        wedding={wedding}
        isPreview={isPreview}
        invitees={invitees}
        rsvpResponses={rsvpResponses}
        handleRsvpToggle={handleRsvpToggle}
        handleRsvpSubmit={handleRsvpSubmit}
        numberOfPersons={numberOfPersons}
        isRsvpDeadlinePassed={isRsvpDeadlinePassed}
        submittingRsvp={submittingRsvp}
        staticDeadline={staticDeadline}
        bgClassName="bg-transparent"
        cardBgClassName={isGlass ? "bg-white/10" : "bg-gray-50"}
        accentColorClass={isGlass ? "text-white" : "text-black"}
      />
    </LumiereTornCard>
  );
};

export default LumiereRsvp;

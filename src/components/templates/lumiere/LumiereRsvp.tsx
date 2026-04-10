import { RsvpSection } from "@/components/templates/RsvpSection";
import LumiereTornCard from "./LumiereTornCard";

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
}: LumiereRsvpProps) => {
  return (
    <LumiereTornCard>
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
        cardBgClassName="bg-gray-50"
        accentColorClass="text-black"
      />
    </LumiereTornCard>
  );
};

export default LumiereRsvp;

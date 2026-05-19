import { RsvpSection } from "@/components/templates/RsvpSection";
import EtoileTornCard from "./EtoileTornCard";

interface EtoileRsvpProps {
  wedding: any;
  isPreview: boolean;
  invitees?: any[];
  rsvpResponses?: Record<string, boolean>;
  handleRsvpToggle?: (inviteeId: string, isAttending: boolean) => void;
  handleRsvpSubmit?: (wishesMessage?: string) => void;
  numberOfPersons?: number;
  isRsvpDeadlinePassed?: boolean;
  submittingRsvp?: boolean;
  staticDeadline?: Date;
  align?: "left" | "right";
}

const EtoileRsvp = ({
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
  align = "left",
}: EtoileRsvpProps) => {
  return (
    <EtoileTornCard align={align}>
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
    </EtoileTornCard>
  );
};

export default EtoileRsvp;

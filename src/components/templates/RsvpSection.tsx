import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { CalendarHeart } from "lucide-react";

interface RsvpSectionProps {
  staticDeadline?: Date;
  wedding?: any;
  isPreview?: boolean;
  invitees?: any[];
  rsvpResponses?: Record<string, boolean>;
  handleRsvpToggle?: (inviteeId: string, isAttending: boolean) => void;
  handleRsvpSubmit?: () => void;
  numberOfPersons?: number;
  isRsvpDeadlinePassed?: boolean;
  submittingRsvp?: boolean;
  bgClassName?: string;
  cardBgClassName?: string;
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
}: RsvpSectionProps) => {
  const rsvpDeadline = staticDeadline || (wedding?.rsvp_deadline ? new Date(wedding.rsvp_deadline) : null);

  return (
    <AnimatedSection animation="fade-up">
      <section className={`py-16 px-4 ${bgClassName}`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-template-subtitle text-center mb-12 text-primary">Join Our Celebration</h2>
            <p className="text-center text-template-body mb-8 text-muted-foreground">
              Please let us know if you can join us on our special day. Your presence would mean the world to us.
            </p>
          </div>

          {invitees.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-gray-300">
              <div className="space-y-4">
                {invitees.map((invitee: any) => (
                  <div
                    key={invitee.id}
                    className={`flex items-center justify-between py-4 px-6 ${cardBgClassName} rounded-lg border border-gray-200 hover:bg-[#f5f0e8] transition-colors`}
                  >
                    <span className="text-xl font-serif text-primary">{invitee.name}</span>
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
                        {rsvpResponses[invitee.id] === true ? "Attending ✓" : "Will Attend?"}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t border-gray-300 space-y-4">
                <p className="text-lg font-semibold text-center text-[#3e2723]">
                  Number of Guests: {numberOfPersons || invitees.length}
                </p>
                {isRsvpDeadlinePassed ? (
                  <p className="text-sm text-red-600 text-center font-medium">RSVP deadline has passed</p>
                ) : (
                  <Button
                    onClick={handleRsvpSubmit}
                    disabled={submittingRsvp}
                    className="w-full text-lg py-6 bg-primary text-white hover:bg-primary/90"
                    size="lg"
                  >
                    {submittingRsvp ? "Submitting..." : "Submit RSVP"}
                  </Button>
                )}
              </div>
            </div>
          )}

          {rsvpDeadline && (
            <div className="pt-8 border-t border-gray-300">
              <p className="text-template-small text-center mb-2 text-gray-600">
                {invitees.length > 0 ? "Please RSVP by:" : "Kindly confirm your attendance before this date:"}
              </p>
              <p className="text-template-heading text-primary text-center">
                {rsvpDeadline.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          )}
        </div>
      </section>
    </AnimatedSection>
  );
};

export default RsvpSection;

import { Calendar, MapPin } from "lucide-react";
import { Icon } from "@iconify/react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import LumiereTornCard from "./LumiereTornCard";

interface TimelineEvent {
  id: string;
  title: string;
  time: string;
  location: string;
  link?: string | null;
  icon: string;
}

interface LumiereEventsProps {
  events: TimelineEvent[];
  dateFormatted: string;
}

const LumiereEvents = ({ events, dateFormatted }: LumiereEventsProps) => {
  if (events.length === 0) return null;

  return (
    <LumiereTornCard>
      <div className="py-14 px-6">
        <AnimatedSection animation="fade-in">
          <div className="flex items-center justify-center gap-3 mb-10">
            <Calendar className="w-6 h-6 text-primary" />
            <h2 className="text-template-subtitle text-primary">{dateFormatted}</h2>
          </div>
        </AnimatedSection>

        <div className="relative max-w-lg mx-auto">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />
          <div className="space-y-12">
            {events.map((event, index) => (
              <AnimatedSection key={event.id} delay={index * 150} animation="fade-in">
                <div className="relative flex items-start">
                  <div className="flex-1 text-right pr-8">
                    <h3 className="text-template-body font-medium">{event.title}</h3>
                    <p className="text-template-body font-semibold">{event.time}</p>
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full z-10" />
                  <div className="flex-1 pl-8">
                    <Icon icon={event.icon} className="w-6 h-6 mb-1 text-primary" />
                    <p className="text-template-small text-muted-foreground leading-snug">{event.location}</p>
                    {event.link && (
                      <a
                        href={event.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-template-small underline mt-1 hover:text-primary transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        Location
                      </a>
                    )}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </LumiereTornCard>
  );
};

export default LumiereEvents;

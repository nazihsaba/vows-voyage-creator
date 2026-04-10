import { Calendar, MapPin } from "lucide-react";
import { Icon } from "@iconify/react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import LumiereTornCard, { TornCardVariant } from "./LumiereTornCard";

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
  cardVariant?: TornCardVariant;
}

const LumiereEvents = ({ events, dateFormatted, cardVariant = "solid" }: LumiereEventsProps) => {
  if (events.length === 0) return null;
  const isGlass = cardVariant === "glass";
  const textColor = isGlass ? "text-white" : "text-black";
  const mutedColor = isGlass ? "text-white/60" : "text-muted-foreground";
  const dotBg = isGlass ? "bg-white" : "bg-black";
  const lineBg = isGlass ? "bg-white/30" : "bg-border";

  return (
    <LumiereTornCard variant={cardVariant}>
      <div className="py-14 px-6">
        <AnimatedSection animation="fade-in">
          <div className="flex items-center justify-center gap-3 mb-10">
            <Calendar className={`w-6 h-6 ${textColor}`} />
            <h2 className={`text-template-subtitle ${textColor}`}>{dateFormatted}</h2>
          </div>
        </AnimatedSection>

        <div className="relative max-w-lg mx-auto">
          <div className={`absolute left-1/2 top-0 bottom-0 w-px ${lineBg} -translate-x-1/2`} />
          <div className="space-y-12">
            {events.map((event, index) => (
              <AnimatedSection key={event.id} delay={index * 150} animation="fade-in">
                <div className="relative flex items-start">
                  <div className="flex-1 text-right pr-8">
                    <h3 className={`text-template-body font-medium ${isGlass ? "text-white" : ""}`}>{event.title}</h3>
                    <p className={`text-template-body font-semibold ${isGlass ? "text-white" : ""}`}>{event.time}</p>
                  </div>
                  <div className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 ${dotBg} rounded-full z-10`} />
                  <div className="flex-1 pl-8">
                    <Icon icon={event.icon} className={`w-6 h-6 mb-1 ${textColor}`} />
                    <p className={`text-template-small ${mutedColor} leading-snug`}>{event.location}</p>
                    {event.link && (
                      <a
                        href={event.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 text-template-small underline mt-1 hover:opacity-80 transition-colors ${isGlass ? "text-white/70" : ""}`}
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

import { Icon } from "@iconify/react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

interface LocationData {
  id?: string;
  type: string;
  time?: string | null;
  location_name?: string | null;
  location_link?: string | null;
  icon?: string | null;
}

interface EventDetailsSectionProps {
  title?: string;
  subtitle?: string;
  ceremony?: LocationData | null;
  venue?: LocationData | null;
  ceremonyLabel?: string;
  venueLabel?: string;
  locationLabel?: string;
  mapButtonText?: string;
  className?: string;
  cardClassName?: string;
  titleClassName?: string;
  textClassName?: string;
  buttonClassName?: string;
  formatTime?: (time: string | null | undefined) => string;
  getLocalizedLocation?: (key: string, fallback: string | null | undefined) => string;
}

const EventDetailsSection = ({
  title = "Wedding Events",
  subtitle = "Join us in celebrating this special day",
  ceremony,
  venue,
  ceremonyLabel = "Ceremony",
  venueLabel = "Venue",
  locationLabel = "Event Location",
  mapButtonText = "View on Map",
  className = "py-16 px-4",
  cardClassName = "bg-[#faf8f5] p-8 rounded-lg shadow-soft space-y-6",
  titleClassName = "text-primary",
  textClassName = "text-[#3e2723]",
  buttonClassName = "inline-block bg-primary text-white px-6 py-2 rounded-md transition-colors",
  formatTime = (t) => t || "",
  getLocalizedLocation = (_key, fallback) => fallback || "",
}: EventDetailsSectionProps) => {
  if (!ceremony && !venue) return null;

  const renderCard = (
    loc: LocationData,
    label: string,
    defaultIcon: string,
    delay: number,
  ) => (
    <AnimatedSection delay={delay} animation="fade-in">
      <div className={cardClassName}>
        <div className="flex items-center justify-center w-full">
          <Icon icon={loc.icon || defaultIcon} className={`w-8 h-8 ${titleClassName}`} />
        </div>
        <h3 className={`text-template-heading mb-2 ${textClassName}`}>{label}</h3>
        <p className={`text-template-body font-bold ${textClassName}`}>{formatTime(loc.time)}</p>
        <div className="space-y-2">
          <p className="text-template-small text-gray-600">{locationLabel}</p>
          <p className={`text-template-body font-medium ${textClassName}`}>
            {getLocalizedLocation(`${loc.type}_location`, loc.location_name)}
          </p>
        </div>
        {loc.location_link && (
          <a href={loc.location_link} target="_blank" rel="noopener noreferrer" className={buttonClassName}>
            {mapButtonText}
          </a>
        )}
      </div>
    </AnimatedSection>
  );

  return (
    <section className={className}>
      <div className="max-w-4xl mx-auto text-center space-y-12">
        <AnimatedSection animation="fade-up">
          <div>
            <h2 className={`text-template-subtitle mb-6 ${titleClassName}`}>{title}</h2>
            <p className="text-template-body max-w-2xl mx-auto">{subtitle}</p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {ceremony && renderCard(ceremony, ceremonyLabel, "material-symbols:church-rounded", 0)}
          {venue && renderCard(venue, venueLabel, "solar:confetti-bold", 200)}
        </div>
      </div>
    </section>
  );
};

export default EventDetailsSection;

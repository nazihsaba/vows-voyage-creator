import { MapPin, Wine } from "lucide-react";
import { Icon } from "@iconify/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatTimeTo12Hour } from "@/lib/formatTime";

interface EventLocationProps {
  type: "ceremony" | "venue";
  locationName?: string;
  locationLink?: string;
  time?: string;
  welcomeDrinkTime?: string;
}

export const EventLocation = ({
  type,
  locationName,
  locationLink,
  time,
  welcomeDrinkTime,
}: EventLocationProps) => {
  const title = type === "ceremony" ? "Ceremony" : "Venue";
  const headerIcon =
    type === "ceremony" ? "material-symbols:church-rounded" : "solar:confetti-bold";

  if (!locationName && !time) return null;

  return (
    <Card className="group relative overflow-hidden border border-border/60 bg-card/95 shadow-soft hover:shadow-elegant transition-all duration-500 hover:-translate-y-0.5">
      {/* Top accent bar */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <CardContent className="p-8 md:p-10">
        {/* Header: icon + title */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 ring-1 ring-primary/20 mb-3 transition-transform duration-500 group-hover:scale-105">
            <Icon icon={headerIcon} className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-2xl md:text-3xl font-serif font-semibold tracking-wide text-foreground">
            {title}
          </h3>
          {/* Decorative divider */}
          <div className="flex items-center gap-2 mt-3">
            <span className="h-px w-8 bg-border" />
            <span className="w-1 h-1 rounded-full bg-primary/60" />
            <span className="h-px w-8 bg-border" />
          </div>
        </div>

        {/* Welcome Drink (venue only) */}
        {type === "venue" && welcomeDrinkTime && (
          <div className="mx-auto mb-5 flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 border border-border/50 w-fit">
            <Wine className="w-3.5 h-3.5 text-primary/80" aria-hidden="true" />
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Welcome Drink
            </span>
            <span className="text-xs font-semibold text-foreground">
              {formatTimeTo12Hour(welcomeDrinkTime)}
            </span>
          </div>
        )}

        {/* Main time */}
        {time && (
          <p className="text-center text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-6">
            {formatTimeTo12Hour(time)}
          </p>
        )}

        {/* Event Location */}
        {locationName && (
          <div className="text-center mb-6 space-y-1.5">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Event Location
            </p>
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4 text-primary/70 shrink-0" aria-hidden="true" />
              <span className="text-base md:text-lg text-foreground">{locationName}</span>
            </div>
          </div>
        )}

        {/* CTA */}
        {locationLink && (
          <div className="text-center pt-2">
            <Button
              asChild
              variant="outline"
              className="border-primary/60 text-primary hover:bg-primary hover:text-primary-foreground rounded-full px-6 transition-colors"
            >
              <a href={locationLink} target="_blank" rel="noopener noreferrer">
                View on Map
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

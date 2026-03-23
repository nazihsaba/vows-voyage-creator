import { MapPin, Clock, Church, PartyPopper } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EventLocationProps {
  type: "ceremony" | "venue";
  locationName?: string;
  locationLink?: string;
  time?: string;
}

export const EventLocation = ({ type, locationName, locationLink, time }: EventLocationProps) => {
  const title = type === "ceremony" ? "Ceremony" : "Venue";
  const Icon = type === "ceremony" ? Church : PartyPopper;
  
  if (!locationName && !time) return null;

  return (
    <Card className="overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-300 rounded-2xl">
      <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center space-y-3">
        <div className="w-10 h-10 flex items-center justify-center text-primary/70">
          <Icon className="w-6 h-6" />
        </div>

        <h3 className="text-xl sm:text-2xl font-script text-primary">
          {title}
        </h3>
        
        {time && (
          <p className="text-sm sm:text-base font-semibold tracking-wide">{time}</p>
        )}

        {locationName && (
          <div className="space-y-1">
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">Event Location</p>
            <p className="text-sm sm:text-base font-medium leading-snug">{locationName}</p>
          </div>
        )}

        {locationLink && (
          <Button
            asChild
            size="sm"
            className="mt-1 rounded-full bg-primary/80 hover:bg-primary text-primary-foreground text-xs sm:text-sm px-4"
          >
            <a href={locationLink} target="_blank" rel="noopener noreferrer">
              View on Map
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

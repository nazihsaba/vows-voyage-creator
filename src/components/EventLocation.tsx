import { MapPin, Clock } from "lucide-react";
import { formatTimeTo12Hour } from "@/lib/formatTime";
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
  
  if (!locationName && !time) return null;

  return (
    <Card className="overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-300">
      <CardContent className="p-8">
        <h3 className="text-2xl md:text-3xl font-serif font-semibold text-primary mb-6 text-center">
          {title}
        </h3>
        
        {time && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-lg">{formatTimeTo12Hour(time)}</span>
          </div>
        )}

        {locationName && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="text-lg text-center">{locationName}</span>
          </div>
        )}

        {locationLink && (
          <div className="text-center">
            <Button
              asChild
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
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
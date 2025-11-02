import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CountdownTimer } from "@/components/CountdownTimer";
import { WeddingGallery } from "@/components/WeddingGallery";
import { EventLocation } from "@/components/EventLocation";
import { GiftCards } from "@/components/GiftCards";
import { EditableWeddingInvite } from "@/components/EditableWeddingInvite";
import { EditableField } from "@/components/EditableField";
import { EditableImage } from "@/components/EditableImage";
import { format } from "date-fns";
import { Loader2, MapPin, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import heroImage from "@/assets/wedding-hero.jpg";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const WeddingInvite = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const [wedding, setWedding] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [giftCards, setGiftCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [fieldCustomizations, setFieldCustomizations] = useState<any>({});
  const { toast } = useToast();

  const updateFieldCustomization = async (fieldId: string, text: string, style: any) => {
    if (!wedding?.id || !isPreview) return;

    try {
      const updatedCustomizations = {
        ...fieldCustomizations,
        [fieldId]: { text, ...style },
      };

      const { error } = await supabase
        .from("weddings")
        .update({ field_customizations: updatedCustomizations })
        .eq("id", wedding.id);

      if (error) throw error;

      setFieldCustomizations(updatedCustomizations);
      toast({
        title: "Updated",
        description: "Changes saved successfully.",
      });
    } catch (error) {
      console.error("Error updating field:", error);
      toast({
        title: "Error",
        description: "Failed to save changes.",
        variant: "destructive",
      });
    }
  };

  const updateMainImage = async (newUrl: string) => {
    if (!wedding?.id || !isPreview) return;

    try {
      const { error } = await supabase
        .from("weddings")
        .update({ main_picture_url: newUrl })
        .eq("id", wedding.id);

      if (error) throw error;

      setWedding({ ...wedding, main_picture_url: newUrl });
      toast({
        title: "Image updated",
        description: "Main image has been changed.",
      });
    } catch (error) {
      console.error("Error updating image:", error);
      toast({
        title: "Error",
        description: "Failed to update image.",
        variant: "destructive",
      });
    }
  };

  const getFieldValue = (fieldId: string, defaultValue: string) => {
    return fieldCustomizations[fieldId]?.text || defaultValue;
  };

  const getFieldStyle = (fieldId: string) => {
    return fieldCustomizations[fieldId] || {};
  };

  useEffect(() => {
    const fetchWedding = async () => {
      if (!slug) return;

      try {
        // Fetch wedding data (allow preview for draft status)
        let query = supabase
          .from("weddings")
          .select("*")
          .eq("slug", slug);
        
        if (!isPreview) {
          query = query.eq("status", "published");
        }
        
        const { data: weddingData, error: weddingError } = await query.maybeSingle();

        if (weddingError) throw weddingError;
        setWedding(weddingData);
        setFieldCustomizations(weddingData?.field_customizations || {});

        // Fetch locations
        const { data: locationsData } = await supabase
          .from("wedding_locations")
          .select("*")
          .eq("wedding_id", weddingData.id);

        setLocations(locationsData || []);

        // Fetch gallery
        const { data: galleryData } = await supabase
          .from("gallery_images")
          .select("*")
          .eq("wedding_id", weddingData.id)
          .order("image_order");

        setGallery(galleryData || []);

        // Fetch gift cards
        const { data: giftCardsData } = await supabase
          .from("gift_cards")
          .select("*")
          .eq("wedding_id", weddingData.id)
          .order("card_order");

        setGiftCards(giftCardsData || []);
      } catch (error) {
        console.error("Error fetching wedding:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWedding();
  }, [slug, isPreview]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-soft">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-soft px-4">
        <div className="text-center">
          <h1 className="text-4xl font-serif font-bold text-primary mb-4">Invitation Not Found</h1>
          <p className="text-lg text-muted-foreground">The wedding invitation you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const ceremony = locations.find((l) => l.type === "ceremony");
  const venue = locations.find((l) => l.type === "venue");

  const sections = [
    "hero",
    "quote",
    "family",
    ...(gallery.length > 0 ? ["gallery"] : []),
    "countdown",
    ...(ceremony ? ["ceremony"] : []),
    ...(venue ? ["venue"] : []),
    ...(giftCards.length > 0 ? ["gifts"] : []),
    ...(wedding.rsvp_deadline ? ["rsvp"] : []),
  ];

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const currentSectionType = sections[currentSection];

  const content = (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Fixed Background Image */}
      <div className="fixed inset-0 w-full h-full">
        {isPreview ? (
          <EditableImage
            imageUrl={wedding.main_picture_url || heroImage}
            onUpdate={updateMainImage}
            isPreview={isPreview}
            className="w-full h-full object-cover"
            alt="Wedding couple"
          />
        ) : (
          <img
            src={wedding.main_picture_url || heroImage}
            alt="Wedding couple"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Mobile Story-Style Layout */}
      <div className="max-w-md mx-auto h-screen relative z-10">
        {/* Navigation Arrows */}
        {currentSection > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSection}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-white/20 hover:bg-white/30 text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        )}
        {currentSection < sections.length - 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={nextSection}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-white/20 hover:bg-white/30 text-white"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        )}

        {/* Progress Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-2">
          {sections.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSection(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSection ? "bg-white w-8" : "bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Sections */}
        <div className="h-full w-full relative">
          {/* Hero Section */}
          {currentSectionType === "hero" && (
            <div className="relative h-full flex items-center justify-center">
              <div className="relative z-10 text-center text-white px-8">
                <EditableField
                  fieldId="groom_name"
                  text={wedding.groom_name}
                  style={getFieldStyle("groom_name")}
                  onUpdate={updateFieldCustomization}
                  isLocked={true}
                  isPreview={isPreview}
                  tag="h1"
                  className="font-serif mb-4"
                />
                <p className="text-4xl mb-4">&</p>
                <EditableField
                  fieldId="bride_name"
                  text={wedding.bride_name}
                  style={getFieldStyle("bride_name")}
                  onUpdate={updateFieldCustomization}
                  isLocked={true}
                  isPreview={isPreview}
                  tag="h1"
                  className="font-serif mb-8"
                />
                <EditableField
                  fieldId="hero_subtitle"
                  text={getFieldValue("hero_subtitle", "are getting married")}
                  style={getFieldStyle("hero_subtitle")}
                  onUpdate={updateFieldCustomization}
                  isPreview={isPreview}
                  tag="p"
                  className="text-xl tracking-wide"
                />
              </div>
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white text-center">
                <p className="text-sm mb-2">Swipe Left</p>
                <ChevronLeft className="w-6 h-6 animate-pulse mx-auto" />
              </div>
            </div>
          )}

          {/* Quote Section */}
          {currentSectionType === "quote" && (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 p-8">
              <div className="text-center text-foreground max-w-md">
                <EditableField
                  fieldId="quote_text"
                  text={getFieldValue("quote_text", wedding.main_description || '"Therefore what God has joined together, let no one separate."')}
                  style={getFieldStyle("quote_text")}
                  onUpdate={updateFieldCustomization}
                  isPreview={isPreview}
                  multiline={true}
                  tag="p"
                  className="text-2xl font-serif italic mb-4"
                />
                <EditableField
                  fieldId="quote_attribution"
                  text={getFieldValue("quote_attribution", "- Mark 10:9")}
                  style={getFieldStyle("quote_attribution")}
                  onUpdate={updateFieldCustomization}
                  isPreview={isPreview}
                  tag="p"
                  className="text-lg text-muted-foreground"
                />
              </div>
            </div>
          )}

          {/* Family Section */}
          {currentSectionType === "family" && (
            <div className="h-full flex items-center justify-center bg-white p-8">
              <div className="text-center max-w-md">
                <EditableField
                  fieldId="family_intro"
                  text={getFieldValue("family_intro", "With joyous hearts,")}
                  style={getFieldStyle("family_intro")}
                  onUpdate={updateFieldCustomization}
                  isPreview={isPreview}
                  tag="p"
                  className="text-xl mb-8 text-muted-foreground"
                />
                <EditableField
                  fieldId="groom_family"
                  text={getFieldValue("groom_family", wedding.groom_family || "Groom's Family")}
                  style={getFieldStyle("groom_family")}
                  onUpdate={updateFieldCustomization}
                  isPreview={isPreview}
                  tag="h3"
                  className="text-3xl font-serif mb-2 text-primary"
                />
                <p className="text-2xl mb-2 text-primary">&</p>
                <EditableField
                  fieldId="bride_family"
                  text={getFieldValue("bride_family", wedding.bride_family || "Bride's Family")}
                  style={getFieldStyle("bride_family")}
                  onUpdate={updateFieldCustomization}
                  isPreview={isPreview}
                  tag="h3"
                  className="text-3xl font-serif mb-8 text-primary"
                />
                <EditableField
                  fieldId="family_description"
                  text={getFieldValue("family_description", "Request the honor of your presence at the wedding of their son and daughter")}
                  style={getFieldStyle("family_description")}
                  onUpdate={updateFieldCustomization}
                  isPreview={isPreview}
                  multiline={true}
                  tag="p"
                  className="text-lg text-muted-foreground"
                />
                <div className="mt-8">
                  <h2 className="text-4xl font-serif text-primary mb-2">
                    {wedding.groom_name} & {wedding.bride_name}
                  </h2>
                  <p className="text-xl text-muted-foreground">
                    on {format(new Date(wedding.wedding_date), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Gallery Section */}
          {currentSectionType === "gallery" && gallery.length > 0 && (
            <div className="h-full overflow-y-auto bg-gradient-soft p-8">
              <div className="grid grid-cols-2 gap-4">
                {gallery.map((image) => (
                  <img
                    key={image.id}
                    src={image.image_url}
                    alt={image.alt_text || "Wedding photo"}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Countdown Section */}
          {currentSectionType === "countdown" && (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-primary/20">
              <div className="text-center">
                <h2 className="text-3xl font-serif text-primary mb-8">Counting Down To</h2>
                <CountdownTimer targetDate={new Date(wedding.wedding_date)} />
              </div>
            </div>
          )}

          {/* Ceremony Section */}
          {currentSectionType === "ceremony" && ceremony && (
            <div className="h-full flex items-center justify-center bg-white p-8">
              <div className="text-center max-w-md">
                <h2 className="text-4xl font-serif text-primary mb-8">Wedding Ceremony</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-3 text-muted-foreground">
                    <Calendar className="w-6 h-6" />
                    <p className="text-lg">
                      {format(new Date(wedding.wedding_date), "EEEE, MMMM d, yyyy")}
                    </p>
                  </div>
                  {ceremony.time && (
                    <p className="text-2xl font-semibold text-primary">
                      {ceremony.time}
                    </p>
                  )}
                  <div className="flex items-start justify-center gap-3 text-muted-foreground mt-6">
                    <MapPin className="w-6 h-6 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-lg font-semibold">{ceremony.location_name}</p>
                      {ceremony.location_link && (
                        <a
                          href={ceremony.location_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline mt-2 inline-block"
                        >
                          View on Map
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Venue Section */}
          {currentSectionType === "venue" && venue && (
            <div className="h-full flex items-center justify-center bg-gradient-soft p-8">
              <div className="text-center max-w-md">
                <h2 className="text-4xl font-serif text-primary mb-8">Wedding Dinner</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-3 text-muted-foreground">
                    <Calendar className="w-6 h-6" />
                    <p className="text-lg">
                      {format(new Date(wedding.wedding_date), "EEEE, MMMM d, yyyy")}
                    </p>
                  </div>
                  {venue.time && (
                    <p className="text-2xl font-semibold text-primary">
                      {venue.time}
                    </p>
                  )}
                  <div className="flex items-start justify-center gap-3 text-muted-foreground mt-6">
                    <MapPin className="w-6 h-6 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-lg font-semibold">{venue.location_name}</p>
                      {venue.location_link && (
                        <a
                          href={venue.location_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline mt-2 inline-block"
                        >
                          View on Map
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gift Cards Section */}
          {currentSectionType === "gifts" && giftCards.length > 0 && (
            <div className="h-full overflow-y-auto bg-white p-8">
              <div className="max-w-md mx-auto">
                <h2 className="text-4xl font-serif text-primary mb-6 text-center">Gift Registry</h2>
                <p className="text-center text-muted-foreground mb-8">
                  Your love, laughter, and company on our wedding day are the greatest gifts of all.
                </p>
                <div className="space-y-4">
                  {giftCards.map((card) => (
                    <div key={card.id} className="p-6 rounded-lg border-2 border-primary/20 bg-gradient-soft">
                      {card.logo_url && (
                        <img src={card.logo_url} alt={card.card_name} className="h-12 mb-4" />
                      )}
                      <h3 className="text-xl font-semibold text-primary mb-2">{card.card_name}</h3>
                      <p className="text-lg font-mono">{card.card_number}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* RSVP Section */}
          {currentSectionType === "rsvp" && wedding.rsvp_deadline && (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 p-8">
              <div className="text-center max-w-md">
                <h2 className="text-3xl font-serif text-primary mb-6">
                  We Can't Wait to Celebrate With You!
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Please enjoy every moment, take lots of pictures, and make wonderful memories with us.
                </p>
                <div className="bg-white/80 backdrop-blur p-6 rounded-lg">
                  <p className="text-xl font-serif text-primary mb-2">
                    Kindly Confirm Your Presence By
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {format(new Date(wedding.rsvp_deadline), "MMMM dd, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isPreview) {
    return (
      <EditableWeddingInvite wedding={wedding} onUpdate={setWedding}>
        {content}
      </EditableWeddingInvite>
    );
  }

  return content;
};

export default WeddingInvite;
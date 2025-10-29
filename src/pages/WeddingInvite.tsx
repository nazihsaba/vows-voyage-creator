import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CountdownTimer } from "@/components/CountdownTimer";
import { WeddingGallery } from "@/components/WeddingGallery";
import { EventLocation } from "@/components/EventLocation";
import { GiftCards } from "@/components/GiftCards";
import { format } from "date-fns";
import { Loader2, Heart } from "lucide-react";
import heroImage from "@/assets/wedding-hero.jpg";

const WeddingInvite = () => {
  const { slug } = useParams();
  const [wedding, setWedding] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [giftCards, setGiftCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWedding = async () => {
      if (!slug) return;

      try {
        // Fetch wedding data
        const { data: weddingData, error: weddingError } = await supabase
          .from("weddings")
          .select("*")
          .eq("slug", slug)
          .eq("status", "published")
          .single();

        if (weddingError) throw weddingError;
        setWedding(weddingData);

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
  }, [slug]);

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

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={wedding.main_picture_url || heroImage}
            alt="Wedding couple"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />
        </div>
        
        <div className="relative z-10 text-center text-white px-4">
          <Heart className="w-16 h-16 mx-auto mb-6 animate-pulse" />
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4">
            The Wedding Of
          </h1>
          <h2 className="text-4xl md:text-6xl font-serif font-semibold mb-8">
            {wedding.groom_name} & {wedding.bride_name}
          </h2>
          <p className="text-2xl md:text-3xl font-light">
            {format(new Date(wedding.wedding_date), "EEEE, dd MMMM yyyy")}
          </p>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-8 h-8 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* Family Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl mb-4">{wedding.groom_family || "Family"}</h3>
          <p className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">&</p>
          <h3 className="text-2xl md:text-3xl mb-8">{wedding.bride_family || "Family"}</h3>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Request the honor of your presence at the wedding of their Son and Daughter
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      {gallery.length > 0 && <WeddingGallery images={gallery} />}

      {/* Countdown Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <CountdownTimer targetDate={new Date(wedding.wedding_date)} />
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-primary mb-4">
              Wedding Events
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {wedding.main_description || "With all humility, we would like to invite you all to attend our wedding"}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {ceremony && (
              <EventLocation
                type="ceremony"
                locationName={ceremony.location_name}
                locationLink={ceremony.location_link}
                time={ceremony.time}
              />
            )}
            {venue && (
              <EventLocation
                type="venue"
                locationName={venue.location_name}
                locationLink={venue.location_link}
                time={venue.time}
              />
            )}
          </div>
        </div>
      </section>

      {/* Gift Cards Section */}
      <GiftCards giftCards={giftCards} />

      {/* RSVP Deadline */}
      {wedding.rsvp_deadline && (
        <section className="py-16 px-4 bg-white text-center">
          <div className="max-w-2xl mx-auto">
            <p className="text-lg md:text-xl text-muted-foreground mb-4">
              We are so excited to share this special day with you! Please enjoy every moment, 
              take lots of pictures, and make wonderful memories with us.
            </p>
            <p className="text-xl md:text-2xl font-serif font-semibold text-primary">
              Kindly Confirm Your Presence By
            </p>
            <p className="text-2xl md:text-3xl font-serif font-bold text-primary mt-2">
              {format(new Date(wedding.rsvp_deadline), "MMMM dd, yyyy")}
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

export default WeddingInvite;
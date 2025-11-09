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
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";
import { useTemplate } from "@/hooks/useTemplate";
import { format } from "date-fns";
import { Loader2, MapPin, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import heroImage from "@/assets/wedding-hero.jpg";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const WeddingInvite = () => {
  const { slug, linkSlug, numberOfPersons } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const isDraftPreview = searchParams.get("draft") === "true";
  const isReadOnly = searchParams.get("readOnly") === "true";
  const canEdit = isPreview && !isReadOnly && !isDraftPreview;
  const [wedding, setWedding] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [giftCards, setGiftCards] = useState<any[]>([]);
  const [invitees, setInvitees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [fieldCustomizations, setFieldCustomizations] = useState<any>({});
  const [rsvpResponses, setRsvpResponses] = useState<Record<string, boolean>>({});
  const [submittingRsvp, setSubmittingRsvp] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const { toast } = useToast();
  
  // Get template configuration if using template system
  const template = useTemplate(wedding?.template_type);

  const updateFieldCustomization = async (fieldId: string, text: string, style: any) => {
    if (!wedding?.id || !canEdit) return;

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
    if (!wedding?.id || !canEdit) return;

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
      try {
        // Check if current user is the owner of this wedding
        const { data: { user } } = await supabase.auth.getUser();
        
        // Check for draft preview data in sessionStorage
        if (isDraftPreview) {
          const previewDataStr = sessionStorage.getItem('weddingPreviewData');
          if (previewDataStr) {
            const previewData = JSON.parse(previewDataStr);
            
            // Set wedding data from preview, mapping preview URLs to expected fields
            setWedding({
              ...previewData,
              id: 'preview-draft',
              status: 'draft',
              main_picture_url: previewData.imagePreview || previewData.main_picture_url,
              video_url: previewData.videoPreview || previewData.video_url,
            });
            
            // Set locations from preview
            const locationData = [];
            if (previewData.locations?.ceremony_location) {
              locationData.push({
                type: 'ceremony',
                location_name: previewData.locations.ceremony_location,
                time: previewData.locations.ceremony_time,
                location_link: previewData.locations.ceremony_location_link,
              });
            }
            if (previewData.locations?.venue_location) {
              locationData.push({
                type: 'venue',
                location_name: previewData.locations.venue_location,
                time: previewData.locations.venue_time,
                location_link: previewData.locations.venue_location_link,
              });
            }
            setLocations(locationData);
            
            // Set gallery from preview
            if (previewData.galleryPreviews && previewData.galleryPreviews.length > 0) {
              const galleryData = previewData.galleryPreviews.map((url: string, index: number) => ({
                id: `preview-${index}`,
                image_url: url,
                image_order: index + 1,
              }));
              setGallery(galleryData);
            }
            
            // Set gift cards from preview
            if (previewData.giftCards) {
              setGiftCards(previewData.giftCards.filter((card: any) => card.card_name && card.card_number));
            }
            
            setLoading(false);
            return;
          }
        }

        if (!slug) return;

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
        
        // Check if current user is the owner
        if (user && weddingData) {
          setIsOwner(user.id === weddingData.user_id);
        }

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

        // Fetch invitees if linkSlug is provided
        if (linkSlug && weddingData?.id) {
          const { data: linkData } = await (supabase as any)
            .from("invitation_links")
            .select("id")
            .eq("wedding_id", weddingData.id)
            .eq("unique_slug", linkSlug)
            .single();

          if (linkData) {
            const { data: inviteesData } = await (supabase as any)
              .from("invitees")
              .select("*")
              .eq("invitation_link_id", linkData.id);

            setInvitees(inviteesData || []);
            
            // Initialize RSVP responses from existing data
            const responses: Record<string, boolean> = {};
            inviteesData?.forEach((invitee: any) => {
              if (invitee.is_attending !== null) {
                responses[invitee.id] = invitee.is_attending;
              }
            });
            setRsvpResponses(responses);
          }
        }
      } catch (error) {
        console.error("Error fetching wedding:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWedding();
  }, [slug, linkSlug, isPreview, isDraftPreview]);

  const handleRsvpToggle = (inviteeId: string, isAttending: boolean) => {
    setRsvpResponses(prev => ({
      ...prev,
      [inviteeId]: isAttending
    }));
  };

  const handleRsvpSubmit = async () => {
    if (invitees.length === 0) return;

    setSubmittingRsvp(true);
    try {
      // Update all invitees - checked boxes get true, unchecked get false
      const updates = invitees.map((invitee) =>
        supabase
          .from("invitees")
          .update({ is_attending: rsvpResponses[invitee.id] === true })
          .eq("id", invitee.id)
      );

      const results = await Promise.all(updates);
      
      // Check if any updates failed
      const hasError = results.some(result => result.error);
      if (hasError) {
        throw new Error("Failed to update some invitees");
      }

      // Refresh invitees data to show updated status
      const updatedInvitees = invitees.map(invitee => ({
        ...invitee,
        is_attending: rsvpResponses[invitee.id] === true
      }));
      setInvitees(updatedInvitees);

      toast({
        title: "RSVP Submitted",
        description: "Thank you for your response!",
      });
    } catch (error) {
      console.error("Error submitting RSVP:", error);
      toast({
        title: "Error",
        description: "Failed to submit RSVP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingRsvp(false);
    }
  };

  const isRsvpDeadlinePassed = wedding?.rsvp_deadline 
    ? new Date(wedding.rsvp_deadline) < new Date() 
    : false;

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

  // If using template system, render with TemplateRenderer
  if (template) {
    const getFieldValue = (fieldId: string, defaultValue: string) => {
      return fieldCustomizations[fieldId]?.text || defaultValue;
    };

    const getFieldStyle = (fieldId: string) => {
      const customization = fieldCustomizations[fieldId];
      if (!customization) return {};
      const { text, ...style } = customization;
      return style;
    };

    const content = (
      <>
        <TemplateRenderer
          template={template}
          wedding={wedding}
          locations={locations}
          gallery={gallery}
          giftCards={giftCards}
          isOwner={isOwner}
          isPreview={canEdit}
          onFieldUpdate={updateFieldCustomization}
          getFieldValue={getFieldValue}
          getFieldStyle={getFieldStyle}
        >
          {/* Hero content passed as children for templates that need it */}
          <div className="text-center text-white space-y-6">
            <h1 className="text-5xl md:text-7xl font-script">
              {wedding.groom_name} & {wedding.bride_name}
            </h1>
            <p className="text-xl md:text-2xl tracking-wide">
              {format(new Date(wedding.wedding_date), "MMMM dd, yyyy")}
            </p>
          </div>
        </TemplateRenderer>
        
        {/* Display invitees section with RSVP if link-specific */}
        {invitees.length > 0 && (
          <div className="bg-gradient-soft py-16 px-4">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif text-primary mb-6 text-center">
                We're Delighted to Invite
              </h2>
              <div className="bg-white rounded-lg shadow-lg p-8">
                <p className="text-lg text-muted-foreground mb-6 text-center">
                  This invitation is specially prepared for:
                </p>
                <div className="space-y-4">
                  {invitees.map((invitee: any) => (
                    <div 
                      key={invitee.id}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <span className="text-xl font-serif text-primary">
                        {invitee.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`rsvp-${invitee.id}`}
                          checked={rsvpResponses[invitee.id] === true}
                          onCheckedChange={(checked) => 
                            handleRsvpToggle(invitee.id, checked as boolean)
                          }
                          disabled={isRsvpDeadlinePassed}
                        />
                        <Label 
                          htmlFor={`rsvp-${invitee.id}`}
                          className={`text-sm cursor-pointer ${isRsvpDeadlinePassed ? 'text-muted-foreground' : ''}`}
                        >
                          {rsvpResponses[invitee.id] === true ? "Attending" : "Will Attend?"}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-border space-y-4">
                  <p className="text-lg font-semibold text-primary text-center">
                    Number of Guests: {numberOfPersons || invitees.length}
                  </p>
                  {wedding?.rsvp_deadline && (
                    <p className="text-sm text-muted-foreground text-center">
                      Please RSVP by {format(new Date(wedding.rsvp_deadline), "MMMM d, yyyy")}
                    </p>
                  )}
                  {isRsvpDeadlinePassed ? (
                    <p className="text-sm text-red-600 text-center font-medium">
                      RSVP deadline has passed
                    </p>
                  ) : (
                    <Button 
                      onClick={handleRsvpSubmit} 
                      disabled={submittingRsvp}
                      className="w-full"
                    >
                      {submittingRsvp ? "Submitting..." : "Submit RSVP"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );

    if (isPreview) {
      return (
        <EditableWeddingInvite wedding={wedding} onUpdate={setWedding}>
          {content}
        </EditableWeddingInvite>
      );
    }

    return content;
  }

  // Default story-style layout for weddings without template_type

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
        {canEdit ? (
          <EditableImage
            imageUrl={wedding.main_picture_url || heroImage}
            onUpdate={updateMainImage}
            isPreview={canEdit}
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
                  isPreview={canEdit}
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
                  isPreview={canEdit}
                  tag="h1"
                  className="font-serif mb-8"
                />
                <EditableField
                  fieldId="hero_subtitle"
                  text={getFieldValue("hero_subtitle", "are getting married")}
                  style={getFieldStyle("hero_subtitle")}
                  onUpdate={updateFieldCustomization}
                  isPreview={canEdit}
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
                  isPreview={canEdit}
                  multiline={true}
                  tag="p"
                  className="text-2xl font-serif italic mb-4"
                />
                <EditableField
                  fieldId="quote_attribution"
                  text={getFieldValue("quote_attribution", "- Mark 10:9")}
                  style={getFieldStyle("quote_attribution")}
                  onUpdate={updateFieldCustomization}
                  isPreview={canEdit}
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
                  isPreview={canEdit}
                  tag="p"
                  className="text-xl mb-8 text-muted-foreground"
                />
                <EditableField
                  fieldId="groom_family"
                  text={getFieldValue("groom_family", wedding.groom_family || "Groom's Family")}
                  style={getFieldStyle("groom_family")}
                  onUpdate={updateFieldCustomization}
                  isPreview={canEdit}
                  tag="h3"
                  className="text-3xl font-serif mb-2 text-primary"
                />
                <p className="text-2xl mb-2 text-primary">&</p>
                <EditableField
                  fieldId="bride_family"
                  text={getFieldValue("bride_family", wedding.bride_family || "Bride's Family")}
                  style={getFieldStyle("bride_family")}
                  onUpdate={updateFieldCustomization}
                  isPreview={canEdit}
                  tag="h3"
                  className="text-3xl font-serif mb-8 text-primary"
                />
                <EditableField
                  fieldId="family_description"
                  text={getFieldValue("family_description", "Request the honor of your presence at the wedding of their son and daughter")}
                  style={getFieldStyle("family_description")}
                  onUpdate={updateFieldCustomization}
                  isPreview={canEdit}
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
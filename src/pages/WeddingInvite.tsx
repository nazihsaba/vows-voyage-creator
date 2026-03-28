import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EditableWeddingInvite } from "@/components/EditableWeddingInvite";
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";
import { useTemplate } from "@/hooks/useTemplate";
import { format } from "date-fns";
import { Loader2, Download, ArrowLeft } from "lucide-react";
import aureaLogoIcon from "@/assets/aureaLogoIcon.png";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { hexToHSL } from "@/lib/colorUtils";
import { downloadCardAsImage } from "@/utils/downloadCard";

const WeddingInvite = () => {
  const { slug, linkSlug, numberOfPersons } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
  const [fieldCustomizations, setFieldCustomizations] = useState<any>({});
  const [rsvpResponses, setRsvpResponses] = useState<Record<string, boolean>>({});
  const [submittingRsvp, setSubmittingRsvp] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [downloadingCard, setDownloadingCard] = useState(false);
  const { toast } = useToast();

  // Get template configuration - defaults to Verite if no template_type
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

  // Apply custom colors from wedding data
  useEffect(() => {
    if (wedding) {
      const root = document.documentElement;

      if (wedding.custom_primary_color) {
        root.style.setProperty("--primary", hexToHSL(wedding.custom_primary_color));
      }
      if (wedding.custom_accent_color) {
        root.style.setProperty("--accent", hexToHSL(wedding.custom_accent_color));
      }
      if (wedding.custom_text_color) {
        root.style.setProperty("--foreground", hexToHSL(wedding.custom_text_color));
      }
    }
  }, [wedding]);

  useEffect(() => {
    const fetchWedding = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        // Check for draft preview data in sessionStorage
        if (isDraftPreview) {
          const previewDataStr = sessionStorage.getItem("weddingPreviewData");
          if (previewDataStr) {
            const previewData = JSON.parse(previewDataStr);

            setWedding({
              ...previewData,
              id: "preview-draft",
              status: "draft",
              main_picture_url: previewData.imagePreview || previewData.main_picture_url,
              video_url: previewData.videoPreview || previewData.video_url,
            });

            const locationData = [];
            if (previewData.locations?.ceremony_location) {
              locationData.push({
                type: "ceremony",
                location_name: previewData.locations.ceremony_location,
                time: previewData.locations.ceremony_time,
                location_link: previewData.locations.ceremony_location_link,
              });
            }
            if (previewData.locations?.venue_location) {
              locationData.push({
                type: "venue",
                location_name: previewData.locations.venue_location,
                time: previewData.locations.venue_time,
                location_link: previewData.locations.venue_location_link,
              });
            }
            setLocations(locationData);

            if (previewData.galleryPreviews && previewData.galleryPreviews.length > 0) {
              const galleryData = previewData.galleryPreviews.map((url: string, index: number) => ({
                id: `preview-${index}`,
                image_url: url,
                image_order: index + 1,
              }));
              setGallery(galleryData);
            }

            if (previewData.giftCards) {
              setGiftCards(previewData.giftCards.filter((card: any) => card.card_name && card.card_number));
            }

            setLoading(false);
            return;
          }
        }

        if (!slug) return;

        let query = supabase.from("weddings").select("*").eq("slug", slug);

        if (!isPreview) {
          query = query.eq("status", "published");
        }

        const { data: weddingData, error: weddingError } = await query.maybeSingle();

        if (weddingError) throw weddingError;
        setWedding(weddingData);
        setFieldCustomizations(weddingData?.field_customizations || {});

        if (user && weddingData) {
          setIsOwner(user.id === weddingData.user_id);
        }

        const { data: locationsData } = await supabase
          .from("wedding_locations")
          .select("*")
          .eq("wedding_id", weddingData.id);

        setLocations(locationsData || []);

        const { data: galleryData } = await supabase
          .from("gallery_images")
          .select("*")
          .eq("wedding_id", weddingData.id)
          .order("image_order");

        setGallery(galleryData || []);

        const { data: giftCardsData } = await supabase
          .from("public_gift_cards")
          .select("*")
          .eq("wedding_id", weddingData.id)
          .order("card_order");

        setGiftCards(giftCardsData || []);

        if (linkSlug && weddingData?.id) {
          const { data: allLinks } = await (supabase as any)
            .from("invitation_links")
            .select("*")
            .eq("wedding_id", weddingData.id);

          const linkData = allLinks?.find((link: any) => {
            const sanitizedLinkName = link.link_name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '');
            return sanitizedLinkName === linkSlug;
          });

          if (linkData) {
            const { data: inviteesData } = await (supabase as any)
              .from("invitees")
              .select("*")
              .eq("invitation_link_id", linkData.id);

            setInvitees(inviteesData || []);

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
    setRsvpResponses((prev) => ({
      ...prev,
      [inviteeId]: isAttending,
    }));
  };

  const handleRsvpSubmit = async () => {
    if (invitees.length === 0) return;

    setSubmittingRsvp(true);
    try {
      const updates = invitees.map((invitee) =>
        supabase
          .from("invitees")
          .update({ is_attending: rsvpResponses[invitee.id] === true })
          .eq("id", invitee.id),
      );

      const results = await Promise.all(updates);

      const hasError = results.some((result) => result.error);
      if (hasError) {
        throw new Error("Failed to update some invitees");
      }

      const updatedInvitees = invitees.map((invitee) => ({
        ...invitee,
        is_attending: rsvpResponses[invitee.id] === true,
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

  const handleDownloadCard = async () => {
    setDownloadingCard(true);
    try {
      await downloadCardAsImage("bachelor-card-preview", `bachelor-party-${wedding?.groom_name?.toLowerCase()}.png`);
      toast({
        title: "Success",
        description: "Card downloaded successfully!",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Error",
        description: "Failed to download card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingCard(false);
    }
  };

  const isRsvpDeadlinePassed = wedding?.rsvp_deadline ? new Date(wedding.rsvp_deadline) < new Date() : false;

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

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-soft px-4">
        <div className="text-center">
          <h1 className="text-4xl font-serif font-bold text-primary mb-4">Template Not Found</h1>
          <p className="text-lg text-muted-foreground">Could not load the invitation template.</p>
        </div>
      </div>
    );
  }

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
      {wedding?.template_type?.includes("bachelor") && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={handleDownloadCard}
            disabled={downloadingCard}
            className="bg-primary/90 hover:bg-primary shadow-lg"
          >
            {downloadingCard ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Card
              </>
            )}
          </Button>
        </div>
      )}
      <div id="bachelor-card-preview">
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
          invitees={invitees}
          rsvpResponses={rsvpResponses}
          handleRsvpToggle={handleRsvpToggle}
          handleRsvpSubmit={handleRsvpSubmit}
          numberOfPersons={numberOfPersons ? parseInt(numberOfPersons) : 0}
          isRsvpDeadlinePassed={isRsvpDeadlinePassed}
          submittingRsvp={submittingRsvp}
        >
          <div className="text-center text-white space-y-6">
            <h1 className="text-5xl md:text-7xl font-script">
              {wedding.groom_name} & {wedding.bride_name}
            </h1>
            <p className="text-xl md:text-2xl tracking-wide">
              {format(new Date(wedding.wedding_date), "MMMM dd, yyyy")}
            </p>
          </div>
        </TemplateRenderer>
      </div>
    </>
  );

  if (canEdit) {
    return (
      <EditableWeddingInvite wedding={wedding} onUpdate={setWedding}>
        {content}
      </EditableWeddingInvite>
    );
  }

  return content;
};

export default WeddingInvite;

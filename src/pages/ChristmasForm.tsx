import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Eye } from "lucide-react";

const ChristmasForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [locations, setLocations] = useState({
    ceremony_location: "",
    ceremony_time: "",
    ceremony_location_link: "",
  });
  const [formData, setFormData] = useState({
    groom_name: "",
    bride_name: "",
    wedding_date: "",
    slug: `christmas-${Date.now()}`,
    status: "draft",
    main_picture_url: "",
    template_type: searchParams.get("template") || "christmas-dinner",
    custom_primary_color: "#8a623a",
    recipient_name: "",
    invitation_text: "",
    event_title: "",
    closing_message: "",
  });

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from("weddings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setFormData({
        ...data,
        recipient_name: (data as any).recipient_name || "",
        invitation_text: (data as any).invitation_text || "",
        event_title: (data as any).event_title || "",
        closing_message: (data as any).closing_message || "",
      });

      const { data: locationsData } = await supabase
        .from("wedding_locations")
        .select("*")
        .eq("wedding_id", id);

      if (locationsData) {
        const ceremony = locationsData.find((loc) => loc.type === "ceremony");
        if (ceremony) {
          setLocations({
            ceremony_location: ceremony.location_name || "",
            ceremony_time: ceremony.time || "",
            ceremony_location_link: ceremony.location_link || "",
          });
        }
      }
    } catch (error: any) {
      console.error("Error fetching event:", error);
      toast({ title: "Error", description: "Failed to load event", variant: "destructive" });
    }
  };

  const generateSlug = (hostName: string) => {
    const slug = `christmas-${hostName}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return slug;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "groom_name" && !id && value) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(value) }));
    }
  };

  const handleLocationChange = (field: string, value: string) => {
    setLocations((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent, statusOverride?: string) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const weddingData = {
        ...formData,
        status: statusOverride || formData.status,
        main_picture_url: null, // Always use default image
        user_id: user.id,
      };

      let weddingId = id;
      if (id) {
        const { error } = await supabase
          .from("weddings")
          .update(weddingData)
          .eq("id", id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("weddings")
          .insert([weddingData])
          .select()
          .single();

        if (error) throw error;
        weddingId = data.id;
        setCreatedEventId(weddingId);
      }

      if (weddingId) {
        if (locations.ceremony_location) {
          const locationData = {
            wedding_id: weddingId,
            type: "ceremony",
            location_name: locations.ceremony_location,
            time: locations.ceremony_time || null,
            location_link: locations.ceremony_location_link || null,
          };

          if (id) {
            const { data: existingLocation } = await supabase
              .from("wedding_locations")
              .select("id")
              .eq("wedding_id", weddingId)
              .eq("type", "ceremony")
              .single();

            if (existingLocation) {
              await supabase
                .from("wedding_locations")
                .update(locationData)
                .eq("id", existingLocation.id);
            } else {
              await supabase.from("wedding_locations").insert([locationData]);
            }
          } else {
            await supabase.from("wedding_locations").insert([locationData]);
          }
        }
      }

      toast({ title: "Success", description: id ? "Event updated successfully" : "Event created successfully" });
      
      if (statusOverride === "published" && weddingId) {
        navigate(`/invite/${formData.slug}`);
      } else {
        navigate("/dashboard/my-events");
      }
    } catch (error: any) {
      console.error("Error saving event:", error);
      toast({ title: "Error", description: error.message || "Failed to save event", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    const eventId = id || createdEventId;
    if (!eventId) {
      toast({ title: "Info", description: "Please save the event first", variant: "default" });
      return;
    }
    window.open(`/invite/${formData.slug}?preview=true`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">
            {id ? "Edit Christmas Dinner" : "Create Christmas Dinner"}
          </h1>
          <div className="flex gap-2">
            {(id || createdEventId) && (
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate("/dashboard/my-events")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Event Details Card */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="groom_name">Host Name *</Label>
                  <Input
                    id="groom_name"
                    name="groom_name"
                    value={formData.groom_name}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wedding_date">Event Date *</Label>
                  <Input
                    type="date"
                    id="wedding_date"
                    name="wedding_date"
                    value={formData.wedding_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient_name">Recipient Name</Label>
                <Input
                  id="recipient_name"
                  name="recipient_name"
                  value={formData.recipient_name}
                  onChange={handleInputChange}
                  placeholder="DEAR GUEST"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invitation_text">Invitation Text</Label>
                <Input
                  id="invitation_text"
                  name="invitation_text"
                  value={formData.invitation_text}
                  onChange={handleInputChange}
                  placeholder="PLEASE JOIN US"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_title">Event Title</Label>
                <Input
                  id="event_title"
                  name="event_title"
                  value={formData.event_title}
                  onChange={handleInputChange}
                  placeholder="Christmas Dinner"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="closing_message">Closing Message</Label>
                <Input
                  id="closing_message"
                  name="closing_message"
                  value={formData.closing_message}
                  onChange={handleInputChange}
                  placeholder="With Love, Your Name"
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Event Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ceremony_location">Location Name</Label>
                  <Input
                    id="ceremony_location"
                    value={locations.ceremony_location}
                    onChange={(e) => handleLocationChange("ceremony_location", e.target.value)}
                    placeholder="123 Street Name, City, Country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ceremony_time">Time</Label>
                  <Input
                    id="ceremony_time"
                    value={locations.ceremony_time}
                    onChange={(e) => handleLocationChange("ceremony_time", e.target.value)}
                    placeholder="6:00 PM"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ceremony_location_link">Google Maps Link</Label>
                  <Input
                    id="ceremony_location_link"
                    value={locations.ceremony_location_link}
                    onChange={(e) => handleLocationChange("ceremony_location_link", e.target.value)}
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 flex-wrap">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save as Draft"
              )}
            </Button>
            <Button
              type="button"
              onClick={(e) => handleSubmit(e, "published")}
              disabled={loading}
              className="flex-1"
              variant="default"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish Event"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ChristmasForm;

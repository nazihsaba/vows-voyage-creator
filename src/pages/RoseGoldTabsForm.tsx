import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Eye, Upload } from "lucide-react";

const RoseGoldTabsForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [locations, setLocations] = useState({
    ceremony_location: "",
    ceremony_time: "",
    ceremony_location_link: "",
    venue_location: "",
    venue_time: "",
    venue_location_link: "",
  });
  const [formData, setFormData] = useState({
    groom_name: "",
    bride_name: "",
    groom_family: "",
    bride_family: "",
    wedding_date: "",
    rsvp_deadline: "",
    slug: `wedding-${Date.now()}`,
    status: "draft",
    main_picture_url: "",
    template_type: searchParams.get("template") || "rose-gold-tabs",
    custom_primary_color: "#fb7185",
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
      setFormData(data);
      if (data.main_picture_url) {
        setImagePreview(data.main_picture_url);
      }

      const { data: locationsData } = await supabase
        .from("wedding_locations")
        .select("*")
        .eq("wedding_id", id);

      if (locationsData) {
        const ceremony = locationsData.find((loc) => loc.type === "ceremony");
        const venue = locationsData.find((loc) => loc.type === "venue");
        
        setLocations({
          ceremony_location: ceremony?.location_name || "",
          ceremony_time: ceremony?.time || "",
          ceremony_location_link: ceremony?.location_link || "",
          venue_location: venue?.location_name || "",
          venue_time: venue?.time || "",
          venue_location_link: venue?.location_link || "",
        });
      }
    } catch (error: any) {
      console.error("Error fetching event:", error);
      toast({ title: "Error", description: "Failed to load event", variant: "destructive" });
    }
  };

  const generateSlug = (groomName: string, brideName: string) => {
    const slug = `${groomName}-${brideName}-wedding`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return slug;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (!id && (name === "groom_name" || name === "bride_name")) {
      const groom = name === "groom_name" ? value : formData.groom_name;
      const bride = name === "bride_name" ? value : formData.bride_name;
      if (groom && bride) {
        setFormData((prev) => ({ ...prev, slug: generateSlug(groom, bride) }));
      }
    }
  };

  const handleLocationChange = (field: string, value: string) => {
    setLocations((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('wedding-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('wedding-images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent, statusOverride?: string) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      let mainPictureUrl = formData.main_picture_url;
      if (imageFile) {
        setUploading(true);
        mainPictureUrl = await uploadImage(imageFile, "main");
        setUploading(false);
      }

      const weddingData = {
        ...formData,
        status: statusOverride || formData.status,
        main_picture_url: mainPictureUrl,
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
        // Handle ceremony location
        if (locations.ceremony_location) {
          const ceremonyData = {
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
                .update(ceremonyData)
                .eq("id", existingLocation.id);
            } else {
              await supabase.from("wedding_locations").insert([ceremonyData]);
            }
          } else {
            await supabase.from("wedding_locations").insert([ceremonyData]);
          }
        }

        // Handle venue location
        if (locations.venue_location) {
          const venueData = {
            wedding_id: weddingId,
            type: "venue",
            location_name: locations.venue_location,
            time: locations.venue_time || null,
            location_link: locations.venue_location_link || null,
          };

          if (id) {
            const { data: existingLocation } = await supabase
              .from("wedding_locations")
              .select("id")
              .eq("wedding_id", weddingId)
              .eq("type", "venue")
              .single();

            if (existingLocation) {
              await supabase
                .from("wedding_locations")
                .update(venueData)
                .eq("id", existingLocation.id);
            } else {
              await supabase.from("wedding_locations").insert([venueData]);
            }
          } else {
            await supabase.from("wedding_locations").insert([venueData]);
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
      setUploading(false);
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
            {id ? "Edit Wedding Invitation" : "Create Wedding Invitation"}
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
          {/* Couple Details Card */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Couple Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="groom_name">Groom's Name *</Label>
                  <Input
                    id="groom_name"
                    name="groom_name"
                    value={formData.groom_name}
                    onChange={handleInputChange}
                    placeholder="Groom's name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bride_name">Bride's Name *</Label>
                  <Input
                    id="bride_name"
                    name="bride_name"
                    value={formData.bride_name}
                    onChange={handleInputChange}
                    placeholder="Bride's name"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="groom_family">Groom's Family Name</Label>
                  <Input
                    id="groom_family"
                    name="groom_family"
                    value={formData.groom_family}
                    onChange={handleInputChange}
                    placeholder="The Groom's Family"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bride_family">Bride's Family Name</Label>
                  <Input
                    id="bride_family"
                    name="bride_family"
                    value={formData.bride_family}
                    onChange={handleInputChange}
                    placeholder="The Bride's Family"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="wedding_date">Wedding Date *</Label>
                  <Input
                    type="date"
                    id="wedding_date"
                    name="wedding_date"
                    value={formData.wedding_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rsvp_deadline">RSVP Deadline</Label>
                  <Input
                    type="date"
                    id="rsvp_deadline"
                    name="rsvp_deadline"
                    value={formData.rsvp_deadline}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Details Card */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Location Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Ceremony</h3>
                <div className="space-y-2">
                  <Label htmlFor="ceremony_location">Ceremony Location</Label>
                  <Input
                    id="ceremony_location"
                    value={locations.ceremony_location}
                    onChange={(e) => handleLocationChange("ceremony_location", e.target.value)}
                    placeholder="Church name or venue"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ceremony_time">Ceremony Time</Label>
                  <Input
                    id="ceremony_time"
                    value={locations.ceremony_time}
                    onChange={(e) => handleLocationChange("ceremony_time", e.target.value)}
                    placeholder="5:30 PM"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ceremony_location_link">Ceremony Google Maps Link</Label>
                  <Input
                    id="ceremony_location_link"
                    value={locations.ceremony_location_link}
                    onChange={(e) => handleLocationChange("ceremony_location_link", e.target.value)}
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-medium">Reception</h3>
                <div className="space-y-2">
                  <Label htmlFor="venue_location">Reception Venue</Label>
                  <Input
                    id="venue_location"
                    value={locations.venue_location}
                    onChange={(e) => handleLocationChange("venue_location", e.target.value)}
                    placeholder="Reception venue name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="venue_time">Reception Time</Label>
                  <Input
                    id="venue_time"
                    value={locations.venue_time}
                    onChange={(e) => handleLocationChange("venue_time", e.target.value)}
                    placeholder="7:30 PM"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="venue_location_link">Reception Google Maps Link</Label>
                  <Input
                    id="venue_location_link"
                    value={locations.venue_location_link}
                    onChange={(e) => handleLocationChange("venue_location_link", e.target.value)}
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
              disabled={loading || uploading}
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
              disabled={loading || uploading}
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

export default RoseGoldTabsForm;
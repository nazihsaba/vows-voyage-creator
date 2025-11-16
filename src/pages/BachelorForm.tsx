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

const BachelorForm = () => {
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
  });
  const [formData, setFormData] = useState({
    groom_name: "",
    bride_name: "",
    groom_family: "",
    bride_family: "",
    wedding_date: "",
    slug: `bachelor-${Date.now()}`,
    status: "draft",
    main_picture_url: "",
    template_type: searchParams.get("template") || "bachelor-leafy",
    custom_primary_color: "#8B7355",
    welcoming_text: "",
    middle_text: "",
    end_text: "",
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
        welcoming_text: (data as any).welcoming_text || "",
        middle_text: (data as any).middle_text || "",
        end_text: (data as any).end_text || "",
      });
      if (data.main_picture_url) {
        setImagePreview(data.main_picture_url);
      }

      // Fetch existing locations
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

  const generateSlug = (groomName: string) => {
    const slug = `bachelor-${groomName}`.toLowerCase().replace(/\s+/g, "-");
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
      
      // If no image file and no existing image, generate one using AI
      if (!imageFile && !mainPictureUrl) {
        setUploading(true);
        toast({ title: "Generating card image...", description: "Creating a custom bachelor party card for you" });
        
        const { data: aiImageData, error: aiError } = await supabase.functions.invoke(
          "generate-bachelor-image",
          {
            body: {
              groomName: formData.groom_name,
              brideName: formData.bride_name,
              eventDate: new Date(formData.wedding_date).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              }),
              theme: "leafy green bachelor party"
            }
          }
        );

        if (aiError) {
          console.error("AI image generation error:", aiError);
          toast({ 
            title: "Info", 
            description: "Continuing without generated image. You can upload one later.", 
            variant: "default" 
          });
        } else if (aiImageData?.imageUrl) {
          mainPictureUrl = aiImageData.imageUrl;
          toast({ title: "Success", description: "Custom card image generated!" });
        }
        setUploading(false);
      } else if (imageFile) {
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
        // Save locations
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
      setUploading(false);
    }
  };

  const handlePreview = () => {
    const eventId = id || createdEventId;
    if (!eventId) {
      toast({ title: "Info", description: "Please save the event first", variant: "default" });
      return;
    }
    window.open(`/invite/${formData.slug}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">
            {id ? "Edit Bachelor Party" : "Create Bachelor Party"}
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
                  <Label htmlFor="groom_name">Groom Name *</Label>
                  <Input
                    id="groom_name"
                    name="groom_name"
                    value={formData.groom_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bride_name">Bride Name *</Label>
                  <Input
                    id="bride_name"
                    name="bride_name"
                    value={formData.bride_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
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

              <div className="space-y-2">
                <Label htmlFor="welcoming_text">Welcoming Text</Label>
                <Textarea
                  id="welcoming_text"
                  name="welcoming_text"
                  value={formData.welcoming_text}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="ONE LAST PARTY WITH THE CREW...BEFORE THEY SAY 'I DO!'"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="middle_text">Middle Text</Label>
                <Textarea
                  id="middle_text"
                  name="middle_text"
                  value={formData.middle_text}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Join us to celebrate with one unforgettable night"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_text">End Text</Label>
                <Textarea
                  id="end_text"
                  name="end_text"
                  value={formData.end_text}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Bring your party spirit; We'll take care of the rest."
                />
              </div>
            </CardContent>
          </Card>

          {/* Main Image Card */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Main Image (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="main_image">Upload Main Image</Label>
                <Input
                  id="main_image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <p className="text-sm text-muted-foreground">
                  If you don't upload an image, we'll automatically generate a custom bachelor party card using AI
                </p>
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full h-auto rounded-lg shadow-soft"
                    />
                  </div>
                )}
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
                    placeholder="Oren Guesthouse - Kfaraabida"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ceremony_time">Time</Label>
                  <Input
                    id="ceremony_time"
                    value={locations.ceremony_time}
                    onChange={(e) => handleLocationChange("ceremony_time", e.target.value)}
                    placeholder="5:30 PM for Ladies and 8:00 PM for Gents"
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

export default BachelorForm;

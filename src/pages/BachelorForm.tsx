import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Eye, Upload, X } from "lucide-react";
import omtLogo from "@/assets/omt-logo.jpg";
import whishLogo from "@/assets/whish-logo.png";

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
  const [giftCards, setGiftCards] = useState<Array<{ card_name: string; card_number: string; logo_url?: string }>>([
    { card_name: "", card_number: "" }
  ]);
  const [cardIconFiles, setCardIconFiles] = useState<Record<number, File | null>>({});
  const [cardIconPreviews, setCardIconPreviews] = useState<Record<number, string>>({});
  const [formData, setFormData] = useState({
    groom_name: "",
    bride_name: "",
    groom_family: "",
    bride_family: "",
    wedding_date: "",
    rsvp_deadline: "",
    main_description: "",
    slug: "",
    status: "draft",
    main_picture_url: "",
    template_type: searchParams.get("template") || "bachelor-leafy",
    custom_primary_color: "#8B7355",
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

      // Fetch existing gift cards
      const { data: cardsData } = await supabase
        .from("gift_cards")
        .select("*")
        .eq("wedding_id", id)
        .order("card_order");

      if (cardsData && cardsData.length > 0) {
        setGiftCards(cardsData.map(card => ({
          card_name: card.card_name,
          card_number: card.card_number,
          logo_url: card.logo_url || undefined
        })));
        // Set icon previews for existing cards
        const previews: Record<number, string> = {};
        cardsData.forEach((card, index) => {
          if (card.logo_url) {
            previews[index] = card.logo_url;
          }
        });
        setCardIconPreviews(previews);
      }
    } catch (error: any) {
      console.error("Error fetching event:", error);
      toast({ title: "Error", description: "Failed to load event", variant: "destructive" });
    }
  };

  const generateSlug = (groomName: string, brideName: string) => {
    const slug = `${groomName}-${brideName}`.toLowerCase().replace(/\s+/g, "-");
    return slug;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "groom_name" || name === "bride_name") {
      const groomName = name === "groom_name" ? value : formData.groom_name;
      const brideName = name === "bride_name" ? value : formData.bride_name;
      if (groomName && brideName) {
        setFormData((prev) => ({ ...prev, slug: generateSlug(groomName, brideName) }));
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

  const handleCardChange = (index: number, field: string, value: string) => {
    const updatedCards = [...giftCards];
    updatedCards[index] = { ...updatedCards[index], [field]: value };
    setGiftCards(updatedCards);
  };

  const addCard = () => {
    setGiftCards([...giftCards, { card_name: "", card_number: "" }]);
  };

  const removeCard = (index: number) => {
    setGiftCards(giftCards.filter((_, i) => i !== index));
    const updatedIconFiles = { ...cardIconFiles };
    delete updatedIconFiles[index];
    setCardIconFiles(updatedIconFiles);
    const updatedIconPreviews = { ...cardIconPreviews };
    delete updatedIconPreviews[index];
    setCardIconPreviews(updatedIconPreviews);
  };

  const handleCardIconUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCardIconFiles(prev => ({ ...prev, [index]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setCardIconPreviews(prev => ({ ...prev, [index]: reader.result as string }));
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

        // Save gift cards
        if (id) {
          await supabase.from("gift_cards").delete().eq("wedding_id", weddingId);
        }

        const validCards = giftCards.filter(card => card.card_name && card.card_number);
        if (validCards.length > 0) {
          const cardsToInsert = await Promise.all(
            validCards.map(async (card, index) => {
              let logoUrl = card.logo_url;
              if (cardIconFiles[index]) {
                logoUrl = await uploadImage(cardIconFiles[index]!, "card-icons");
              }
              return {
                wedding_id: weddingId,
                card_name: card.card_name,
                card_number: card.card_number,
                logo_url: logoUrl,
                card_order: index + 1,
              };
            })
          );
          await supabase.from("gift_cards").insert(cardsToInsert);
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

              <div className="grid gap-6 md:grid-cols-2">
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

              <div className="space-y-2">
                <Label htmlFor="main_description">Event Description</Label>
                <Textarea
                  id="main_description"
                  name="main_description"
                  value={formData.main_description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="with one unforgettable night of fun, friends, and questionable decisions."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Event URL Slug *</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  placeholder="groom-bride"
                />
                <p className="text-sm text-muted-foreground">
                  Your event will be accessible at: {window.location.origin}/invite/{formData.slug}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Main Image Card */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Main Image</CardTitle>
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

          {/* Gift Cards */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Gift Cards (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {giftCards.map((card, index) => (
                <div key={index} className="p-4 border border-border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Card {index + 1}</h3>
                    {giftCards.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCard(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Card Name</Label>
                      <Input
                        value={card.card_name}
                        onChange={(e) => handleCardChange(index, "card_name", e.target.value)}
                        placeholder="e.g., OMT, Whish"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Card Number</Label>
                      <Input
                        value={card.card_number}
                        onChange={(e) => handleCardChange(index, "card_number", e.target.value)}
                        placeholder="e.g., 03123456"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Card Logo (Optional)</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCardIconUpload(index, e)}
                    />
                    {cardIconPreviews[index] && (
                      <img
                        src={cardIconPreviews[index]}
                        alt={`Card ${index + 1} logo`}
                        className="h-16 object-contain mt-2"
                      />
                    )}
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addCard} className="w-full">
                Add Another Card
              </Button>
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

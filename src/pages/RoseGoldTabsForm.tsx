import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Eye, Upload, X } from "lucide-react";
import omtLogo from "@/assets/omt-logo.jpg";
import whishLogo from "@/assets/whish-logo.png";
import AudioTrimField from "@/components/AudioTrimField";

const RoseGoldTabsForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [createdWeddingId, setCreatedWeddingId] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [audioStartTime, setAudioStartTime] = useState<number>(0);
  const [audioEndTime, setAudioEndTime] = useState<number>(0);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingGalleryImages, setExistingGalleryImages] = useState<any[]>([]);
  const [locations, setLocations] = useState({
    ceremony_location: "",
    ceremony_time: "",
    ceremony_location_link: "",
    venue_location: "",
    venue_time: "",
    venue_location_link: "",
  });
  const [giftCards, setGiftCards] = useState<Array<{ card_name: string; card_number: string; logo_url?: string }>>([
    { card_name: "", card_number: "" }
  ]);
  const [cardIconFiles, setCardIconFiles] = useState<Record<number, File | null>>({});
  const [cardIconPreviews, setCardIconPreviews] = useState<Record<number, string>>({});
  
  const templateType = searchParams.get("template") || "rose-gold-tabs";
  const isBibleVerseTabs = templateType === "bible-verse-tabs";
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
    video_url: "",
    template_type: searchParams.get("template") || "rose-gold-tabs",
    custom_primary_color: "#fb7185",
  });

  useEffect(() => {
    if (id) {
      fetchWedding();
    }
  }, [id]);

  const fetchWedding = async () => {
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
      if (data.video_url) {
        setVideoPreview(data.video_url);
      }
      if (data.audio_url) {
        setAudioUrl(data.audio_url);
        setAudioStartTime(data.audio_start_time || 0);
        setAudioEndTime(data.audio_end_time || 0);
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

      // Fetch existing gallery images
      const { data: galleryData } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("wedding_id", id)
        .order("image_order");
      
      if (galleryData) {
        setExistingGalleryImages(galleryData);
      }

      const { data: giftCardsData } = await supabase
        .from("gift_cards")
        .select("*")
        .eq("wedding_id", id)
        .order("card_order");

      if (giftCardsData && giftCardsData.length > 0) {
        setGiftCards(giftCardsData.map(card => ({
          card_name: card.card_name,
          card_number: card.card_number,
          logo_url: card.logo_url,
        })));
      }
    } catch (error: any) {
      console.error("Error fetching wedding:", error);
      toast({ title: "Error", description: "Failed to load wedding", variant: "destructive" });
    }
  };

  const generateSlug = (groomName: string, brideName: string) => {
    return `${groomName}-${brideName}`.toLowerCase().replace(/\s+/g, "-");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData({ ...formData, main_picture_url: "" });
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview("");
    setFormData({ ...formData, video_url: "" });
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingGalleryImages.length + galleryFiles.length + files.length;
    
    if (totalImages > 6) {
      toast({
        title: "Maximum 6 images",
        description: `You can only upload ${6 - existingGalleryImages.length - galleryFiles.length} more image(s)`,
        variant: "destructive",
      });
      return;
    }

    setGalleryFiles([...galleryFiles, ...files]);
    
    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryFile = (index: number) => {
    setGalleryFiles(galleryFiles.filter((_, i) => i !== index));
    setGalleryPreviews(galleryPreviews.filter((_, i) => i !== index));
  };

  const removeExistingGalleryImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from("gallery_images")
        .delete()
        .eq("id", imageId);

      if (error) throw error;

      setExistingGalleryImages(existingGalleryImages.filter((img) => img.id !== imageId));
      toast({ title: "Image removed successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const uploadImage = async (file: File, userId: string, index?: number) => {
    const fileExt = file.name.split('.').pop();
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${index !== undefined ? `-${index}` : ''}`;
    const fileName = `${userId}/${uniqueId}.${fileExt}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('wedding-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('wedding-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let imageUrl = formData.main_picture_url;
      let videoUrl = formData.video_url;
      let uploadedAudioUrl = audioUrl;

      // Upload new image if selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, user.id);
      }

      // Upload new video if selected
      if (videoFile) {
        videoUrl = await uploadImage(videoFile, user.id);
      }

      // Upload new audio if selected, or clear if removed
      if (audioFile) {
        uploadedAudioUrl = await uploadImage(audioFile, user.id);
      } else if (!audioUrl) {
        // Audio was removed, clear it
        uploadedAudioUrl = null;
      }

      const slug = formData.slug || generateSlug(formData.groom_name, formData.bride_name);

      let weddingId = id;

      if (id) {
        const { error } = await supabase
          .from("weddings")
          .update({ 
            ...formData, 
            slug, 
            main_picture_url: imageUrl, 
            video_url: videoUrl,
            audio_url: uploadedAudioUrl,
            audio_start_time: uploadedAudioUrl ? audioStartTime : null,
            audio_end_time: uploadedAudioUrl ? audioEndTime : null
          })
          .eq("id", id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("weddings")
          .insert([{ 
            ...formData, 
            slug, 
            main_picture_url: imageUrl, 
            video_url: videoUrl,
            audio_url: uploadedAudioUrl,
            audio_start_time: audioStartTime,
            audio_end_time: audioEndTime,
            user_id: user.id 
          }])
          .select()
          .single();

        if (error) throw error;
        weddingId = data.id;
        setCreatedWeddingId(data.id);
        setFormData({ ...formData, slug: data.slug, main_picture_url: imageUrl, video_url: videoUrl });
      }

      // Save locations
      if (id) {
        // Delete existing locations
        await supabase.from("wedding_locations").delete().eq("wedding_id", weddingId);
      }

      const locationInserts = [];
      if (locations.ceremony_location || locations.ceremony_time || locations.ceremony_location_link) {
        locationInserts.push({
          wedding_id: weddingId,
          type: 'ceremony',
          location_name: locations.ceremony_location,
          time: locations.ceremony_time,
          location_link: locations.ceremony_location_link,
        });
      }
      if (locations.venue_location || locations.venue_time || locations.venue_location_link) {
        locationInserts.push({
          wedding_id: weddingId,
          type: 'venue',
          location_name: locations.venue_location,
          time: locations.venue_time,
          location_link: locations.venue_location_link,
        });
      }

      if (locationInserts.length > 0) {
        const { error: locError } = await supabase
          .from("wedding_locations")
          .insert(locationInserts);
        if (locError) throw locError;
      }

      // Save gift cards
      if (id) {
        // Delete existing gift cards
        await supabase.from("gift_cards").delete().eq("wedding_id", weddingId);
      }

      const validCards = giftCards.filter(card => card.card_name && card.card_number);
      if (validCards.length > 0) {
        // Upload card icons if any
        const cardInserts = await Promise.all(
          validCards.map(async (card, index) => {
            let logoUrl = card.logo_url;
            
            // Find original index in giftCards array
            const originalIndex = giftCards.findIndex(c => 
              c.card_name === card.card_name && c.card_number === card.card_number
            );
            
            // Upload new icon if file exists
            if (cardIconFiles[originalIndex]) {
              logoUrl = await uploadImage(cardIconFiles[originalIndex]!, user.id);
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

        const { error: cardError } = await supabase
          .from("gift_cards")
          .insert(cardInserts);
        if (cardError) throw cardError;
      }

      // Upload gallery images for bible-verse-tabs template
      if (isBibleVerseTabs && galleryFiles.length > 0) {
        // Get the highest image_order to append new images
        const { data: maxOrderData } = await supabase
          .from("gallery_images")
          .select("image_order")
          .eq("wedding_id", weddingId)
          .order("image_order", { ascending: false })
          .limit(1);

        const startOrder = (maxOrderData?.[0]?.image_order || 0) + 1;

        const galleryInserts = await Promise.all(
          galleryFiles.map(async (file, index) => ({
            wedding_id: weddingId,
            image_url: await uploadImage(file, user.id, index),
            image_order: startOrder + index,
          }))
        );

        const { error: galleryError } = await supabase
          .from("gallery_images")
          .insert(galleryInserts);

        if (galleryError) throw galleryError;
      }

      toast({ title: id ? "Wedding updated successfully!" : "Wedding created successfully!" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-3xl font-serif">
              {id ? "Edit Wedding" : "Create Wedding Invitation"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="groom_name">Groom Name *</Label>
                  <Input
                    id="groom_name"
                    value={formData.groom_name}
                    onChange={(e) => setFormData({ ...formData, groom_name: e.target.value })}
                    required
                    disabled={!!id}
                  />
                  {id && <p className="text-xs text-muted-foreground">This field cannot be edited</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bride_name">Bride Name *</Label>
                  <Input
                    id="bride_name"
                    value={formData.bride_name}
                    onChange={(e) => setFormData({ ...formData, bride_name: e.target.value })}
                    required
                    disabled={!!id}
                  />
                  {id && <p className="text-xs text-muted-foreground">This field cannot be edited</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="groom_family">Groom's Family</Label>
                  <Input
                    id="groom_family"
                    value={formData.groom_family}
                    onChange={(e) => setFormData({ ...formData, groom_family: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bride_family">Bride's Family</Label>
                  <Input
                    id="bride_family"
                    value={formData.bride_family}
                    onChange={(e) => setFormData({ ...formData, bride_family: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wedding_date">Wedding Date *</Label>
                  <Input
                    id="wedding_date"
                    type="date"
                    value={formData.wedding_date}
                    onChange={(e) => setFormData({ ...formData, wedding_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rsvp_deadline">Confirmation Deadline</Label>
                  <Input
                    id="rsvp_deadline"
                    type="date"
                    value={formData.rsvp_deadline}
                    onChange={(e) => setFormData({ ...formData, rsvp_deadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="main_description">Description</Label>
                <Textarea
                  id="main_description"
                  value={formData.main_description}
                  onChange={(e) => setFormData({ ...formData, main_description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom_primary_color">Primary Color (Rose Gold)</Label>
                <div className="flex gap-2">
                  <Input
                    id="custom_primary_color"
                    type="color"
                    value={formData.custom_primary_color}
                    onChange={(e) => setFormData({ ...formData, custom_primary_color: e.target.value })}
                    className="w-20 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={formData.custom_primary_color}
                    onChange={(e) => setFormData({ ...formData, custom_primary_color: e.target.value })}
                    placeholder="#fb7185"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This color will be used for accents and decorative elements throughout the invitation
                </p>
              </div>

              {/* Background Photo or Video - only for rose-gold-tabs */}
              {!isBibleVerseTabs && (
                <div className="space-y-2">
                  <Label htmlFor="main_picture">Background Photo or Video</Label>
                  <p className="text-sm text-muted-foreground">
                    Upload a photo or video to display as the fullscreen background
                  </p>
                  <div className="flex flex-col gap-4">
                    {videoPreview ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-border">
                        <video 
                          src={videoPreview} 
                          className="w-full h-full object-cover"
                          controls
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={removeVideo}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : imagePreview ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-border">
                        <img 
                          src={imagePreview} 
                          alt="Wedding preview" 
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={removeImage}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <label
                          htmlFor="main_video"
                          className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors"
                        >
                          <Upload className="w-12 h-12 mb-2 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Click to upload video (recommended)</span>
                          <span className="text-xs text-muted-foreground mt-1">MP4, MOV up to 50MB</span>
                        </label>
                        <div className="text-center text-sm text-muted-foreground">or</div>
                        <label
                          htmlFor="main_picture"
                          className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors"
                        >
                          <Upload className="w-12 h-12 mb-2 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Click to upload image</span>
                          <span className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</span>
                        </label>
                      </>
                    )}
                    <Input
                      id="main_video"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="hidden"
                    />
                    <Input
                      id="main_picture"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {/* Gallery Images Section - for bible-verse-tabs */}
              {isBibleVerseTabs && (
                <div className="space-y-2">
                  <Label>Gallery Images (up to 6)</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload images to showcase in your wedding gallery
                  </p>
                  
                  {/* Existing Gallery Images */}
                  {existingGalleryImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      {existingGalleryImages.map((image) => (
                        <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden border-2 border-border">
                          <img 
                            src={image.image_url} 
                            alt={image.alt_text || "Gallery image"} 
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => removeExistingGalleryImage(image.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New Gallery Images */}
                  {galleryPreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      {galleryPreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-border">
                          <img 
                            src={preview} 
                            alt={`New gallery image ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => removeGalleryFile(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Button */}
                  {(existingGalleryImages.length + galleryFiles.length) < 6 && (
                    <>
                      <label
                        htmlFor="gallery_images"
                        className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors"
                      >
                        <Upload className="w-12 h-12 mb-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Click to upload images</span>
                        <span className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB each</span>
                      </label>
                      <Input
                        id="gallery_images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryChange}
                        className="hidden"
                      />
                    </>
                  )}
                </div>
              )}

              {/* Audio Background Section */}
              <div className="space-y-2 border-t pt-6">
                <Label>Background Music</Label>
                <p className="text-sm text-muted-foreground">
                  Upload an audio file and trim it to play in the background
                </p>
                <AudioTrimField
                  key={`audio-${id}-${audioUrl}`}
                  onAudioTrimmed={(blob, startTime, endTime) => {
                    // Convert Blob to File
                    const file = new File([blob], "audio.wav", { type: "audio/wav" });
                    const url = URL.createObjectURL(blob);
                    setAudioFile(file);
                    setAudioUrl(url);
                    setAudioStartTime(startTime);
                    setAudioEndTime(endTime);
                  }}
                  onAudioRemoved={() => {
                    setAudioFile(null);
                    setAudioUrl("");
                    setAudioStartTime(0);
                    setAudioEndTime(0);
                  }}
                  initialAudioUrl={audioUrl}
                  initialStartTime={audioStartTime}
                  initialEndTime={audioEndTime}
                />
              </div>

              {/* Location Fields */}
              <div className="space-y-6 border-t pt-6">
                <h3 className="text-lg font-semibold">Event Locations</h3>
                
                {/* Ceremony Section */}
                <Card className="border">
                  <CardHeader>
                    <CardTitle className="text-xl">Ceremony Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ceremony_location">Location Name</Label>
                        <Input
                          id="ceremony_location"
                          value={locations.ceremony_location}
                          onChange={(e) => setLocations({ ...locations, ceremony_location: e.target.value })}
                          placeholder="Church or venue name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ceremony_time">Time</Label>
                        <Input
                          id="ceremony_time"
                          type="time"
                          value={locations.ceremony_time}
                          onChange={(e) => setLocations({ ...locations, ceremony_time: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ceremony_location_link">Ceremony Map link</Label>
                      <Input
                        id="ceremony_location_link"
                        value={locations.ceremony_location_link}
                        onChange={(e) => setLocations({ ...locations, ceremony_location_link: e.target.value })}
                        placeholder="https://maps.google.com/..."
                        type="url"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Venue Section */}
                <Card className="border">
                  <CardHeader>
                    <CardTitle className="text-xl">Venue Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="venue_location">Location Name</Label>
                        <Input
                          id="venue_location"
                          value={locations.venue_location}
                          onChange={(e) => setLocations({ ...locations, venue_location: e.target.value })}
                          placeholder="Reception venue name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="venue_time">Time</Label>
                        <Input
                          id="venue_time"
                          type="time"
                          value={locations.venue_time}
                          onChange={(e) => setLocations({ ...locations, venue_time: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="venue_location_link">Venue map link</Label>
                      <Input
                        id="venue_location_link"
                        value={locations.venue_location_link}
                        onChange={(e) => setLocations({ ...locations, venue_location_link: e.target.value })}
                        placeholder="https://maps.google.com/..."
                        type="url"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Card List Section */}
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Gift Cards</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setGiftCards([...giftCards, { card_name: "", card_number: "" }])}
                  >
                    Add Card
                  </Button>
                </div>

                {giftCards.map((card, index) => (
                  <div key={index} className="grid gap-4 p-4 border rounded-lg relative">
                    <div className="grid md:grid-cols-3 gap-4 items-end">
                      <div className="space-y-2">
                        <Label htmlFor={`card_name_${index}`}>Card Name</Label>
                        <Select
                          value={card.card_name}
                          onValueChange={(value) => {
                            const newCards = [...giftCards];
                            newCards[index].card_name = value;
                            setGiftCards(newCards);
                          }}
                        >
                          <SelectTrigger id={`card_name_${index}`}>
                            <SelectValue placeholder="Select card" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OMT">OMT</SelectItem>
                            <SelectItem value="Whish">Whish</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`card_number_${index}`}>Card Number</Label>
                        <Input
                          id={`card_number_${index}`}
                          value={card.card_number}
                          onChange={(e) => {
                            const newCards = [...giftCards];
                            newCards[index].card_number = e.target.value;
                            setGiftCards(newCards);
                          }}
                          placeholder="XXXX-XXXX-XXXX-XXXX"
                        />
                      </div>
                      {card.card_name && (
                        <div className="space-y-2">
                          <Label>Card Icon</Label>
                          <div className="h-10 w-24 rounded-lg overflow-hidden border flex items-center justify-center bg-muted/20 p-2">
                            <img 
                              src={card.card_name === 'OMT' ? omtLogo : whishLogo} 
                              alt={card.card_name} 
                              className="max-h-full max-w-full object-contain rounded-[6px]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {giftCards.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          const newCards = giftCards.filter((_, i) => i !== index);
                          setGiftCards(newCards);
                          const newFiles = { ...cardIconFiles };
                          delete newFiles[index];
                          setCardIconFiles(newFiles);
                          const newPreviews = { ...cardIconPreviews };
                          delete newPreviews[index];
                          setCardIconPreviews(newPreviews);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Custom URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g., john-jane-2024"
                  disabled={!!id}
                />
                {id && <p className="text-xs text-muted-foreground">This field cannot be edited</p>}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading || uploading} className="flex-1">
                  {loading || uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : id ? "Update" : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // For existing weddings with slug, open preview
                    if (id && formData.slug) {
                      setPreviewUrl(`/invite/${formData.slug}?preview=true&readOnly=true`);
                    } else {
                      // For new/unsaved weddings, store preview data
                      const previewData = {
                        ...formData,
                        locations,
                        giftCards,
                        imagePreview,
                      };
                      sessionStorage.setItem('weddingPreviewData', JSON.stringify(previewData));
                      setPreviewUrl(`/invite/preview?draft=true&readOnly=true`);
                    }
                    setPreviewModalOpen(true);
                  }}
                  disabled={!formData.groom_name || !formData.bride_name || !formData.wedding_date}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                {(id || createdWeddingId) && (
                  <>
                    <Button
                      type="button"
                      variant={formData.status === "published" ? "outline" : "default"}
                      disabled={loading}
                      onClick={async () => {
                        const weddingId = id || createdWeddingId;
                        if (!weddingId) return;
                        setLoading(true);
                        try {
                          const newStatus = formData.status === "published" ? "draft" : "published";
                          const { error } = await supabase
                            .from("weddings")
                            .update({ status: newStatus })
                            .eq("id", weddingId);
                          
                          if (error) throw error;
                          
                          setFormData({ ...formData, status: newStatus });
                          toast({ 
                            title: newStatus === "published" ? "Wedding published!" : "Wedding unpublished",
                            description: newStatus === "published" ? "Your invitation is now live" : "Your invitation is now in draft mode"
                          });
                        } catch (error: any) {
                          toast({
                            title: "Error",
                            description: error.message,
                            variant: "destructive",
                          });
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      {formData.status === "published" ? "Unpublish" : "Publish"}
                    </Button>
                  </>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
            <DialogTitle>Preview Invitation</DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full overflow-hidden px-6 pb-6">
            <iframe
              src={previewUrl}
              className="w-full h-full border-0 rounded-lg"
              title="Wedding Invitation Preview"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoseGoldTabsForm;
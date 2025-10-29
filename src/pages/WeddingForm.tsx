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

const WeddingForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    groom_name: "",
    bride_name: "",
    groom_family: "",
    bride_family: "",
    wedding_date: "",
    main_description: "",
    slug: "",
    status: "draft",
    main_picture_url: "",
    template_type: searchParams.get("template") || "template1",
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
    } catch (error) {
      console.error("Error fetching wedding:", error);
    }
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

  const uploadImage = async (file: File, userId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('wedding-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('wedding-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const generateSlug = (groomName: string, brideName: string) => {
    return `${groomName}-${brideName}`.toLowerCase().replace(/\s+/g, "-");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let imageUrl = formData.main_picture_url;

      // Upload new image if selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, user.id);
      }

      const slug = formData.slug || generateSlug(formData.groom_name, formData.bride_name);

      if (id) {
        const { error } = await supabase
          .from("weddings")
          .update({ ...formData, slug, main_picture_url: imageUrl })
          .eq("id", id);

        if (error) throw error;
        toast({ title: "Wedding updated successfully!" });
      } else {
        const { error } = await supabase
          .from("weddings")
          .insert([{ ...formData, slug, main_picture_url: imageUrl, user_id: user.id }]);

        if (error) throw error;
        toast({ title: "Wedding created successfully!" });
      }

      navigate("/dashboard");
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
                <Label htmlFor="main_description">Description</Label>
                <Textarea
                  id="main_description"
                  value={formData.main_description}
                  onChange={(e) => setFormData({ ...formData, main_description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="main_picture">Main Wedding Photo</Label>
                <div className="flex flex-col gap-4">
                  {imagePreview ? (
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
                    <label
                      htmlFor="main_picture"
                      className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      <Upload className="w-12 h-12 mb-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to upload image</span>
                      <span className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</span>
                    </label>
                  )}
                  <Input
                    id="main_picture"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
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
                {formData.slug && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.open(`/invite/${formData.slug}?preview=true`, "_blank")}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData({ ...formData, status: formData.status === "published" ? "draft" : "published" })}
                >
                  {formData.status === "published" ? "Unpublish" : "Publish"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeddingForm;
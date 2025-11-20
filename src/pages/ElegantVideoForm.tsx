import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const ElegantVideoForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    groomName: "",
    brideName: "",
    weddingDate: "",
    weddingTime: "",
    videoUrl: "",
    mainDescription: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create an invitation",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const slug = `${formData.groomName.toLowerCase()}-${formData.brideName.toLowerCase()}-${Date.now()}`.replace(/\s+/g, '-');
      const weddingDateTime = `${formData.weddingDate}T${formData.weddingTime || '00:00'}`;

      const { error } = await supabase.from("weddings").insert({
        user_id: user.id,
        groom_name: formData.groomName,
        bride_name: formData.brideName,
        wedding_date: weddingDateTime,
        slug: slug,
        template_type: "elegant-video",
        video_url: formData.videoUrl,
        main_description: formData.mainDescription,
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your invitation has been created",
      });

      navigate("/dashboard/my-events");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background py-12 px-4">
      <div className="container max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="bg-card rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-serif font-bold text-center mb-8">
            Elegant Video Invitation
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="groomName">Groom's Name *</Label>
                <Input
                  id="groomName"
                  value={formData.groomName}
                  onChange={(e) => setFormData({ ...formData, groomName: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="brideName">Bride's Name *</Label>
                <Input
                  id="brideName"
                  value={formData.brideName}
                  onChange={(e) => setFormData({ ...formData, brideName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weddingDate">Wedding Date *</Label>
                <Input
                  id="weddingDate"
                  type="date"
                  value={formData.weddingDate}
                  onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="weddingTime">Wedding Time</Label>
                <Input
                  id="weddingTime"
                  type="time"
                  value={formData.weddingTime}
                  onChange={(e) => setFormData({ ...formData, weddingTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="videoUrl">Background Video URL *</Label>
              <Input
                id="videoUrl"
                type="url"
                placeholder="https://example.com/video.mp4"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Direct link to an MP4 video file
              </p>
            </div>

            <div>
              <Label htmlFor="mainDescription">Description (Optional)</Label>
              <Textarea
                id="mainDescription"
                placeholder="Share your story..."
                value={formData.mainDescription}
                onChange={(e) => setFormData({ ...formData, mainDescription: e.target.value })}
                rows={4}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Invitation"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ElegantVideoForm;

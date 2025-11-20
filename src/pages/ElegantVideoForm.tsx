import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Upload, Video } from "lucide-react";

const ElegantVideoForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>("");

  const [formData, setFormData] = useState({
    groomName: "",
    brideName: "",
    weddingDate: "",
    weddingTime: "",
    mainDescription: "",
  });

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 500MB)
      if (file.size > 524288000) {
        toast({
          title: "File too large",
          description: "Video must be under 500MB",
          variant: "destructive",
        });
        return;
      }

      // Check file type
      const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload MP4, MOV, AVI, or WEBM video files",
          variant: "destructive",
        });
        return;
      }

      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadVideo = async (userId: string) => {
    if (!videoFile) return null;

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = videoFile.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('wedding-videos')
        .upload(fileName, videoFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('wedding-videos')
        .getPublicUrl(fileName);

      setUploadProgress(100);
      return publicUrl;
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoFile) {
      toast({
        title: "Video required",
        description: "Please upload a video file",
        variant: "destructive",
      });
      return;
    }

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

      // Upload video first
      const videoUrl = await uploadVideo(user.id);
      if (!videoUrl) {
        setLoading(false);
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
        video_url: videoUrl,
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
            Cinematic Monogram Invitation
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
              <Label htmlFor="videoFile">Background Video *</Label>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('videoFile')?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {videoFile ? 'Change Video' : 'Upload Video'}
                  </Button>
                  <input
                    id="videoFile"
                    type="file"
                    accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                </div>
                
                {videoFile && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Video className="w-4 h-4" />
                      <span>{videoFile.name}</span>
                      <span className="text-xs">
                        ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    
                    {videoPreviewUrl && (
                      <video
                        src={videoPreviewUrl}
                        className="w-full h-48 rounded-lg object-cover"
                        controls
                      />
                    )}
                  </div>
                )}
                
                {uploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} />
                    <p className="text-sm text-center text-muted-foreground">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground">
                  Accepted formats: MP4, MOV, AVI, WEBM (max 500MB)
                </p>
              </div>
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
              disabled={loading || uploading || !videoFile}
            >
              {loading ? "Creating..." : uploading ? "Uploading..." : "Create Invitation"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ElegantVideoForm;

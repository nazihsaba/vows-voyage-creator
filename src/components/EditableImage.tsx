import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Edit3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface EditableImageProps {
  imageUrl: string;
  onUpdate: (newUrl: string) => void;
  onRemove?: () => void;
  isPreview?: boolean;
  className?: string;
  alt?: string;
}

export const EditableImage = ({
  imageUrl,
  onUpdate,
  onRemove,
  isPreview = false,
  className,
  alt = "Image",
}: EditableImageProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // Get the current user for user-scoped storage path
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to upload images");
      }

      const fileExt = file.name.split(".").pop();
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const fileName = `${uniqueId}.${fileExt}`;
      // Use user-scoped path for secure storage policy compliance
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("wedding-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("wedding-images").getPublicUrl(filePath);

      onUpdate(publicUrl);
      toast({
        title: "Image updated",
        description: "Your image has been successfully changed.",
      });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  if (!isPreview) {
    return <img src={imageUrl} alt={alt} className={className} />;
  }

  return (
    <>
      <div
        className="relative group w-full h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img src={imageUrl} alt={alt} className={cn(className, "transition-all")} />

        {isHovered && !isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 transition-all z-10">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              className="bg-white/90 hover:bg-white"
            >
              <Upload className="w-4 h-4 mr-1" />
              Change
            </Button>
            {onRemove && (
              <Button
                size="sm"
                variant="destructive"
                onClick={onRemove}
                className="bg-destructive/90 hover:bg-destructive"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Remove
              </Button>
            )}
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="text-white text-sm">Uploading...</div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  );
};

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit2, Save, X, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EditableWeddingInviteProps {
  wedding: any;
  onUpdate: (updatedWedding: any) => void;
  children: React.ReactNode;
}

export const EditableWeddingInvite = ({ wedding, onUpdate, children }: EditableWeddingInviteProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    groom_family: wedding?.groom_family || "",
    bride_family: wedding?.bride_family || "",
    main_description: wedding?.main_description || "",
  });
  const [colors, setColors] = useState({
    primary: wedding?.custom_primary_color || "#E0C097",
    accent: wedding?.custom_accent_color || "#E6B7B8",
    text: wedding?.custom_text_color || "#2C2C2C",
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Apply colors immediately when they change
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary", colors.primary);
    root.style.setProperty("--accent", colors.accent);
    root.style.setProperty("--foreground", colors.text);
  }, [colors]);

  const handleSave = async () => {
    if (!wedding?.id) return;
    
    setIsSaving(true);
    try {
      const updateData = {
        ...editData,
        custom_primary_color: colors.primary,
        custom_accent_color: colors.accent,
        custom_text_color: colors.text,
      };

      const { data, error } = await supabase
        .from("weddings")
        .update(updateData)
        .eq("id", wedding.id)
        .select()
        .single();

      if (error) throw error;

      onUpdate(data);
      setIsEditing(false);
      toast({
        title: "Changes saved",
        description: "Your wedding details have been updated.",
      });
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        title: "Error saving changes",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      groom_family: wedding?.groom_family || "",
      bride_family: wedding?.bride_family || "",
      main_description: wedding?.main_description || "",
    });
    setColors({
      primary: wedding?.custom_primary_color || "#E0C097",
      accent: wedding?.custom_accent_color || "#E6B7B8",
      text: wedding?.custom_text_color || "#2C2C2C",
    });
    setIsEditing(false);
  };

  return (
    <div className="relative">
      {/* Edit Controls */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-white/90 text-primary hover:bg-white shadow-lg"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        ) : (
          <>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary text-white shadow-lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="bg-white shadow-lg"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </>
        )}
      </div>

      {/* Edit Panel */}
      {isEditing && (
        <div className="fixed left-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-40 overflow-y-auto">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="w-full rounded-none border-b">
              <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
              <TabsTrigger value="colors" className="flex-1">
                <Palette className="w-4 h-4 mr-2" />
                Colors
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="p-6">
              <h3 className="text-xl font-serif font-bold text-primary mb-6">Edit Content</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">🔒 Locked Fields</p>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">Groom's Name</Label>
                      <p className="text-sm font-medium">{wedding?.groom_name}</p>
                    </div>
                    <div>
                      <Label className="text-xs">Bride's Name</Label>
                      <p className="text-sm font-medium">{wedding?.bride_name}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="groom_family">Groom's Family</Label>
                  <Input
                    id="groom_family"
                    value={editData.groom_family}
                    onChange={(e) => setEditData({ ...editData, groom_family: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="bride_family">Bride's Family</Label>
                  <Input
                    id="bride_family"
                    value={editData.bride_family}
                    onChange={(e) => setEditData({ ...editData, bride_family: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="main_description">Description/Quote</Label>
                  <Textarea
                    id="main_description"
                    value={editData.main_description}
                    onChange={(e) => setEditData({ ...editData, main_description: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="colors" className="p-6">
              <h3 className="text-xl font-serif font-bold text-primary mb-6">Customize Colors</h3>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="primary-color">Primary Color (Gold)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={colors.primary}
                      onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                      className="w-20 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={colors.primary}
                      onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accent-color">Accent Color (Blush)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="accent-color"
                      type="color"
                      value={colors.accent}
                      onChange={(e) => setColors({ ...colors, accent: e.target.value })}
                      className="w-20 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={colors.accent}
                      onChange={(e) => setColors({ ...colors, accent: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="text-color">Text Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="text-color"
                      type="color"
                      value={colors.text}
                      onChange={(e) => setColors({ ...colors, text: e.target.value })}
                      className="w-20 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={colors.text}
                      onChange={(e) => setColors({ ...colors, text: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-xs text-muted-foreground">
                    ✨ Colors are applied instantly as you select them. Click "Save" to persist your changes.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Content */}
      <div className={isEditing ? "ml-96" : ""}>
        {children}
      </div>
    </div>
  );
};

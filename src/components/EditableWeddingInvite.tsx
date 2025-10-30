import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit2, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EditableWeddingInviteProps {
  wedding: any;
  onUpdate: (updatedWedding: any) => void;
  children: React.ReactNode;
}

export const EditableWeddingInvite = ({ wedding, onUpdate, children }: EditableWeddingInviteProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    groom_name: wedding?.groom_name || "",
    bride_name: wedding?.bride_name || "",
    groom_family: wedding?.groom_family || "",
    bride_family: wedding?.bride_family || "",
    main_description: wedding?.main_description || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!wedding?.id) return;
    
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from("weddings")
        .update(editData)
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
      groom_name: wedding?.groom_name || "",
      bride_name: wedding?.bride_name || "",
      groom_family: wedding?.groom_family || "",
      bride_family: wedding?.bride_family || "",
      main_description: wedding?.main_description || "",
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
        <div className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-40 overflow-y-auto p-6">
          <h3 className="text-xl font-serif font-bold text-primary mb-6">Edit Details</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="groom_name">Groom's Name</Label>
              <Input
                id="groom_name"
                value={editData.groom_name}
                onChange={(e) => setEditData({ ...editData, groom_name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="bride_name">Bride's Name</Label>
              <Input
                id="bride_name"
                value={editData.bride_name}
                onChange={(e) => setEditData({ ...editData, bride_name: e.target.value })}
              />
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
        </div>
      )}

      {/* Content */}
      <div className={isEditing ? "ml-80" : ""}>
        {children}
      </div>
    </div>
  );
};

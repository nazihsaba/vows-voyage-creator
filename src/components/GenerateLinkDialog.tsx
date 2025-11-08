import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X } from "lucide-react";

interface GenerateLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weddingId: string;
  onLinkGenerated: () => void;
}

export const GenerateLinkDialog = ({ open, onOpenChange, weddingId, onLinkGenerated }: GenerateLinkDialogProps) => {
  const [linkName, setLinkName] = useState("");
  const [numberOfPersons, setNumberOfPersons] = useState(1);
  const [invitees, setInvitees] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addInvitee = () => {
    setInvitees([...invitees, ""]);
  };

  const removeInvitee = (index: number) => {
    setInvitees(invitees.filter((_, i) => i !== index));
  };

  const updateInvitee = (index: number, value: string) => {
    const updated = [...invitees];
    updated[index] = value;
    setInvitees(updated);
  };

  const generateUniqueSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      + "-" + Math.random().toString(36).substring(2, 8);
  };

  const handleGenerate = async () => {
    if (!linkName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a link name",
        variant: "destructive",
      });
      return;
    }

    const validInvitees = invitees.filter(name => name.trim() !== "");
    if (validInvitees.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one invitee",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const uniqueSlug = generateUniqueSlug(linkName);

      // Create the invitation link
      const { data: linkData, error: linkError } = await supabase
        .from("invitation_links")
        .insert({
          wedding_id: weddingId,
          link_name: linkName,
          unique_slug: uniqueSlug,
          number_of_persons: numberOfPersons,
        })
        .select()
        .single();

      if (linkError) throw linkError;

      // Create invitees
      const inviteesToInsert = validInvitees.map(name => ({
        invitation_link_id: linkData.id,
        name: name.trim(),
      }));

      const { error: inviteesError } = await supabase
        .from("invitees")
        .insert(inviteesToInsert);

      if (inviteesError) throw inviteesError;

      toast({
        title: "Link Generated!",
        description: `Invitation link created: ${uniqueSlug}`,
      });

      // Reset form
      setLinkName("");
      setNumberOfPersons(1);
      setInvitees([""]);
      onLinkGenerated();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate link",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Invitation Link</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="linkName">Link Unique Name</Label>
            <Input
              id="linkName"
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
              placeholder="e.g., family-smith"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfPersons">Number of Persons</Label>
            <Input
              id="numberOfPersons"
              type="number"
              min="1"
              value={numberOfPersons}
              onChange={(e) => setNumberOfPersons(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Invitees</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addInvitee}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Invitee
              </Button>
            </div>
            
            <div className="space-y-2">
              {invitees.map((invitee, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={invitee}
                    onChange={(e) => updateInvitee(index, e.target.value)}
                    placeholder={`Invitee ${index + 1} name`}
                  />
                  {invitees.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeInvitee(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating..." : "Generate Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

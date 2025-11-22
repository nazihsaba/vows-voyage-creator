import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GenerateLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weddingId: string;
  weddingSlug: string;
  onSuccess: () => void;
}

export const GenerateLinkDialog = ({
  open,
  onOpenChange,
  weddingId,
  weddingSlug,
  onSuccess,
}: GenerateLinkDialogProps) => {
  const { toast } = useToast();
  const [linkName, setLinkName] = useState("");
  const [uniqueSlug, setUniqueSlug] = useState("");
  const [invitees, setInvitees] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("manual");

  const handleLinkNameChange = (value: string) => {
    setLinkName(value);
    if (!slugManuallyEdited) {
      const autoSlug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setUniqueSlug(autoSlug);
    }
  };

  const handleAddInvitee = () => {
    setInvitees([...invitees, ""]);
  };

  const handleRemoveInvitee = (index: number) => {
    setInvitees(invitees.filter((_, i) => i !== index));
  };

  const handleInviteeChange = (index: number, value: string) => {
    const updated = [...invitees];
    updated[index] = value;
    setInvitees(updated);
  };

  const handleSubmit = async () => {
    if (!linkName.trim() || !uniqueSlug.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const validInvitees = invitees.filter(name => name.trim());
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
      const { data: linkData, error: linkError } = await (supabase as any)
        .from("invitation_links")
        .insert({
          wedding_id: weddingId,
          link_name: linkName,
          unique_slug: uniqueSlug,
          number_of_persons: validInvitees.length,
        })
        .select()
        .single();

      if (linkError) throw linkError;

      const inviteeRecords = validInvitees.map(name => ({
        invitation_link_id: linkData.id,
        name: name.trim(),
      }));

      const { error: inviteeError } = await (supabase as any)
        .from("invitees")
        .insert(inviteeRecords);

      if (inviteeError) throw inviteeError;

      toast({
        title: "Success",
        description: "Invitation link created successfully",
      });

      setLinkName("");
      setUniqueSlug("");
      setInvitees([""]);
      setSlugManuallyEdited(false);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating invitation link:", error);
      toast({
        title: "Error",
        description: "Failed to create invitation link",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Error",
          description: "Please select an Excel file (.xlsx or .xls)",
          variant: "destructive",
        });
      }
    }
  };

  const handleAutomaticGeneration = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select an Excel file",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('weddingSlug', weddingSlug);
      formData.append('weddingId', weddingId);

      const response = await fetch('https://aurea-invites.app.n8n.cloud/webhook-test/read-invitees-csv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process file');
      }

      toast({
        title: "Success",
        description: "Invitations are being generated automatically",
      });

      setSelectedFile(null);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "Failed to process the file",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const previewUrl = uniqueSlug 
    ? `${window.location.origin}/invite/${weddingSlug}/${uniqueSlug}/${invitees.filter(n => n.trim()).length}`
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Invitation Link</DialogTitle>
          <DialogDescription>
            Create invitation links manually or automatically from a file
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="automatic">Automatic</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="linkName">Link Name *</Label>
            <p className="text-sm text-muted-foreground">A friendly name to identify this invitation group (e.g., "Family Smith", "Work Colleagues")</p>
            <Input
              id="linkName"
              placeholder="e.g., Family Smith"
              value={linkName}
              onChange={(e) => handleLinkNameChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="uniqueSlug">Link Unique Identifier *</Label>
            <p className="text-sm text-muted-foreground">A unique URL-friendly identifier that will be part of the invitation link</p>
            <Input
              id="uniqueSlug"
              placeholder="e.g., family-smith"
              value={uniqueSlug}
              onChange={(e) => {
                setSlugManuallyEdited(true);
                setUniqueSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
              }}
            />
          </div>

          {previewUrl && (
            <Card className="p-3 bg-muted">
              <Label className="text-xs text-muted-foreground">Preview URL:</Label>
              <p className="text-sm font-mono break-all">{previewUrl}</p>
            </Card>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label>Invitees ({invitees.filter(n => n.trim()).length})</Label>
                <p className="text-sm text-muted-foreground mt-1">Add the names of people who will receive this invitation link</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddInvitee}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Invitee
              </Button>
            </div>

            <div className="space-y-2">
              {invitees.map((invitee, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Invitee ${index + 1} name`}
                    value={invitee}
                    onChange={(e) => handleInviteeChange(index, e.target.value)}
                  />
                  {invitees.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveInvitee(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
          </TabsContent>

          <TabsContent value="automatic" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Upload Excel File</Label>
                <p className="text-sm text-muted-foreground">
                  Upload an .xlsx or .xls file containing your invitee information
                </p>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {selectedFile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {selectedFile && (
                  <Card className="p-3 bg-muted">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                    </div>
                  </Card>
                )}
              </div>

              <Card className="p-4 bg-muted/50 border-dashed">
                <p className="text-sm text-muted-foreground">
                  The Excel file will be processed to automatically generate invitation links for all invitees listed in the file.
                </p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {activeTab === "manual" ? (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating..." : "Create Link"}
            </Button>
          ) : (
            <Button onClick={handleAutomaticGeneration} disabled={loading || !selectedFile}>
              {loading ? "Processing..." : "Generate Automatically"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

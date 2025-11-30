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

      const webhookUrl = 'https://aurea-invites.app.n8n.cloud/webhook-test/read-invitees-csv';
      console.log("Sending file to n8n workflow:", webhookUrl);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to process file: ${response.statusText}`);
      }

      toast({
        title: "Success",
        description: "File sent to n8n workflow. Invitations are being generated.",
      });

      setSelectedFile(null);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending file to n8n:", error);
      toast({
        title: "Error",
        description: "Failed to send file to n8n workflow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sanitizedLinkName = linkName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  const previewUrl = uniqueSlug && linkName
    ? `${window.location.origin}/invite/${uniqueSlug}/${sanitizedLinkName}/${invitees.filter(n => n.trim()).length}`
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

          <TabsContent value="automatic" className="space-y-6 py-4">
            <div className="space-y-6">
              {/* Upload Area */}
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Upload className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <Label className="text-base font-semibold">Upload Your Guest List</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Select an Excel file (.xlsx or .xls) with your invitee information
                    </p>
                  </div>
                </div>
                
                {!selectedFile ? (
                  <label htmlFor="file-upload" className="block">
                    <Card className="p-8 border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer bg-muted/30 hover:bg-muted/50">
                      <div className="flex flex-col items-center justify-center gap-3 text-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Upload className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Click to upload</p>
                          <p className="text-sm text-muted-foreground mt-1">Excel files only (.xlsx, .xls)</p>
                        </div>
                      </div>
                    </Card>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <Card className="p-4 bg-primary/5 border-primary/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Upload className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground">Ready to process</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedFile(null)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                )}
              </div>

              {/* Information Card */}
              <Card className="p-5 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">✓</span>
                    </div>
                    <p className="text-sm text-foreground">
                      Your Excel file will be automatically processed to generate personalized invitation links for all invitees
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">✓</span>
                    </div>
                    <p className="text-sm text-foreground">
                      Each invitee will receive a unique link based on the information in your file
                    </p>
                  </div>
                </div>
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

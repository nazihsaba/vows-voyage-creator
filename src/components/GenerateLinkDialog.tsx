import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Plus, X, Upload, Download, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as XLSX from "xlsx";

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
  const navigate = useNavigate();
  const [linkName, setLinkName] = useState("");
  const [uniqueSlug, setUniqueSlug] = useState("");
  const [side, setSide] = useState("");
  const [countryCode, setCountryCode] = useState("+961");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [invitees, setInvitees] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("manual");

  const handleLinkNameChange = (value: string) => {
    setLinkName(value);
    if (!slugManuallyEdited) {
      const autoSlug = value
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
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

    const validInvitees = invitees.filter((name) => name.trim());
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
          link_name: linkName.replace(/\b\w/g, (c) => c.toUpperCase()),
          unique_slug: uniqueSlug,
          number_of_persons: validInvitees.length,
          side: side.trim() || null,
          phone_number: phoneNumber.trim() ? `${countryCode}${phoneNumber.trim()}` : null,
        })
        .select()
        .single();

      if (linkError) throw linkError;

      const inviteeRecords = validInvitees.map((name) => ({
        invitation_link_id: linkData.id,
        name: name.trim().replace(/\b\w/g, (c) => c.toUpperCase()),
      }));

      const { error: inviteeError } = await (supabase as any).from("invitees").insert(inviteeRecords);

      if (inviteeError) throw inviteeError;

      toast({
        title: "Success",
        description: "Invitation link created successfully",
      });

      setLinkName("");
      setUniqueSlug("");
      setSide("");
      setCountryCode("+961");
      setPhoneNumber("");
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
      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
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

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/invitation_template.xlsx';
    link.download = 'invitation_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "Template downloaded successfully",
    });
  };

  const getLinksCount = async () => {
    const { count } = await supabase
      .from("invitation_links")
      .select("*", { count: "exact", head: true })
      .eq("wedding_id", weddingId);
    return count ?? 0;
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
      formData.append("file", selectedFile);
      formData.append("weddingSlug", weddingSlug);
      formData.append("weddingId", weddingId);

      const webhookUrl = "https://aurea-invites.app.n8n.cloud/webhook/read-invitees-csv";
      console.log("Sending file to n8n workflow:", webhookUrl);

      const response = await fetch(webhookUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to process file: ${response.statusText}`);
      }

      // Wait for the response data (handle both JSON and text responses)
      const contentType = response.headers.get("content-type");
      let result;
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        result = await response.text();
      }
      console.log("n8n workflow response:", result);

      // Extract message from the webhook response
      const responseMessage =
        typeof result === "string"
          ? result
          : result?.message || result?.description || "Your invitation links have been generated successfully.";

      toast({
        title: "Success!",
        description: responseMessage,
      });

      setSelectedFile(null);
      // Poll for new data to appear in the database before closing
      const initialCount = await getLinksCount();
      let attempts = 0;
      const maxAttempts = 10;
      const pollInterval = 1500;
      
      const poll = async () => {
        attempts++;
        const currentCount = await getLinksCount();
        if (currentCount > initialCount || attempts >= maxAttempts) {
          setLoading(false);
          onSuccess();
          onOpenChange(false);
        } else {
          setTimeout(poll, pollInterval);
        }
      };
      
      setTimeout(poll, pollInterval);
    } catch (error) {
      console.error("Error sending file to n8n:", error);
      toast({
        title: "Error",
        description: "Failed to generate invitation links. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const sanitizedLinkName = linkName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const previewUrl =
    uniqueSlug && linkName
      ? `${window.location.origin}/invite/${uniqueSlug}/${sanitizedLinkName}/${invitees.filter((n) => n.trim()).length}`
      : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden p-0 gap-0 rounded-2xl sm:rounded-2xl border-border/60 shadow-xl flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-3 sm:pb-4 border-b border-border/50 bg-gradient-to-br from-primary/5 to-secondary/5">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
                <Plus className="w-4 h-4 text-primary" />
              </div>
              <DialogTitle className="text-base sm:text-lg font-serif font-bold text-foreground">
                Generate Invitation Link
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs sm:text-sm pl-0 sm:pl-9">
              Create invitation links manually or automatically from a file
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 overflow-y-auto flex-1 min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10 rounded-xl bg-muted/60">
              <TabsTrigger value="manual" className="rounded-lg text-xs sm:text-sm data-[state=active]:shadow-sm">
                Manual
              </TabsTrigger>
              <TabsTrigger value="automatic" className="rounded-lg text-xs sm:text-sm data-[state=active]:shadow-sm">
                Automatic
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 mt-0">
              <div className="space-y-1.5">
                <Label htmlFor="linkName" className="text-xs sm:text-sm font-medium">Link Name *</Label>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug">
                  A friendly name for this invitation group
                </p>
                <Input
                  id="linkName"
                  placeholder="e.g., Family Smith"
                  value={linkName}
                  onChange={(e) => handleLinkNameChange(e.target.value)}
                  className="h-9 sm:h-10 text-sm rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="uniqueSlug" className="text-xs sm:text-sm font-medium">Link Unique Identifier *</Label>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug">
                  A unique URL-friendly identifier for the invitation link
                </p>
                <Input
                  id="uniqueSlug"
                  placeholder="e.g., family-smith"
                  value={uniqueSlug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    setUniqueSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                  }}
                  className="h-9 sm:h-10 text-sm rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="side" className="text-xs sm:text-sm font-medium">Side</Label>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug">
                  Which side of the wedding party?
                </p>
                <select
                  id="side"
                  value={side}
                  onChange={(e) => setSide(e.target.value)}
                  className="flex h-9 sm:h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select side (optional)</option>
                  <option value="GROOM">Groom</option>
                  <option value="BRIDE">Bride</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phoneNumber" className="text-xs sm:text-sm font-medium">Phone Number</Label>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug">
                  Guest's phone number with country code
                </p>
                <div className="flex gap-1.5">
                  <Input
                    id="countryCode"
                    placeholder="+961"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="h-9 sm:h-10 text-sm rounded-lg w-20 shrink-0"
                  />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="e.g., 71123456"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-9 sm:h-10 text-sm rounded-lg"
                  />
                </div>
              </div>

              {previewUrl && (
                <Card className="p-2.5 sm:p-3 bg-muted/50 rounded-lg border-border/50">
                  <Label className="text-[10px] sm:text-xs text-muted-foreground">Preview URL:</Label>
                  <p className="text-[11px] sm:text-sm font-mono break-all mt-0.5">{previewUrl}</p>
                </Card>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <Label className="text-xs sm:text-sm font-medium">
                      Invitees ({invitees.filter((n) => n.trim()).length})
                    </Label>
                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-snug">
                      Add the names of people for this invitation
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddInvitee} className="rounded-lg shrink-0 h-8 text-xs px-2.5">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add
                  </Button>
                </div>

                <div className="space-y-1.5">
                  {invitees.map((invitee, index) => (
                    <div key={index} className="flex gap-1.5">
                      <Input
                        placeholder={`Invitee ${index + 1} name`}
                        value={invitee}
                        onChange={(e) => handleInviteeChange(index, e.target.value)}
                        className="h-9 sm:h-10 text-sm rounded-lg"
                      />
                      {invitees.length > 1 && (
                        <Button type="button" variant="outline" size="icon" onClick={() => handleRemoveInvitee(index)} className="shrink-0 h-9 w-9 sm:h-10 sm:w-10 rounded-lg">
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="automatic" className="space-y-4 sm:space-y-5 pt-3 sm:pt-4 mt-0">
              <div className="space-y-4 sm:space-y-5">
                {/* Download Template */}
                <Card className="p-3 sm:p-4 bg-accent/5 border-accent/20 rounded-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <Download className="w-4 h-4 sm:w-5 sm:h-5 text-accent-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-foreground">Download Template</p>
                          <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">Recommended</span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                          Pre-formatted Excel with example data
                        </p>
                      </div>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={handleDownloadTemplate} className="rounded-lg h-8 text-xs self-end sm:self-auto">
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Download
                    </Button>
                  </div>
                </Card>

                {/* Upload Area */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <Label className="text-sm font-semibold">Upload Your Guest List</Label>
                      <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                        Select an Excel file (.xlsx or .xls)
                      </p>
                    </div>
                  </div>

                  {!selectedFile ? (
                    <label htmlFor="file-upload" className="block">
                      <Card className="p-5 sm:p-8 border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer bg-muted/30 hover:bg-muted/50 rounded-xl">
                        <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 text-center">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Click to upload</p>
                            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">Excel files only (.xlsx, .xls)</p>
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
                    <Card className="p-3 sm:p-4 bg-primary/5 border-primary/20 rounded-xl">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{selectedFile.name}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Ready to process</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedFile(null)}
                          className="hover:bg-destructive/10 hover:text-destructive shrink-0 h-8 w-8 rounded-lg"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>

                {/* Info Card */}
                <Card className="p-3 sm:p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10 rounded-xl">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] sm:text-xs font-bold text-primary">✓</span>
                      </div>
                      <p className="text-[11px] sm:text-sm text-foreground leading-snug">
                        Your file will be processed to generate personalized invitation links
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] sm:text-xs font-bold text-primary">✓</span>
                      </div>
                      <p className="text-[11px] sm:text-sm text-foreground leading-snug">
                        Each invitee will receive a unique link
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border/50 bg-muted/30 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-2 shrink-0 rounded-b-2xl">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="rounded-lg h-9 sm:h-10 text-sm">
            Cancel
          </Button>
          {activeTab === "manual" ? (
            <Button onClick={handleSubmit} disabled={loading} className="rounded-lg h-9 sm:h-10 text-sm">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "Creating..." : "Create Link"}
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              {loading && (
                <p className="text-xs text-muted-foreground animate-pulse">
                  Hang tight — generating your links, this may take a few moments…
                </p>
              )}
              <Button onClick={handleAutomaticGeneration} disabled={loading || !selectedFile} className="rounded-lg h-9 sm:h-10 text-sm shrink-0">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {loading ? "Processing..." : "Generate Automatically"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

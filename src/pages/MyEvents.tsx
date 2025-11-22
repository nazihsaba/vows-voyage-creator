import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowLeft, Edit, Trash2, ExternalLink, Link2, List, Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { GenerateLinkDialog } from "@/components/GenerateLinkDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Wedding {
  id: string;
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  status: string;
  slug: string;
  template_type: string;
  created_at: string;
  main_picture_url?: string;
}

const getEventType = (templateType: string): string => {
  if (templateType?.includes('bachelor')) return 'Bachelor Party';
  if (templateType?.includes('christmas') || templateType?.includes('birthday')) return 'Christmas Dinner';
  return 'Wedding';
};

const groupEventsByType = (events: Wedding[]) => {
  const grouped: Record<string, Wedding[]> = {
    'Wedding': [],
    'Bachelor Party': [],
    'Christmas Dinner': [],
  };
  
  events.forEach(event => {
    const type = getEventType(event.template_type);
    grouped[type].push(event);
  });
  
  return grouped;
};

const MyEvents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [generateLinkOpen, setGenerateLinkOpen] = useState(false);
  const [generateOptionsOpen, setGenerateOptionsOpen] = useState(false);
  const [selectedWeddingId, setSelectedWeddingId] = useState<string | null>(null);
  const [selectedWeddingSlug, setSelectedWeddingSlug] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    checkUserAndFetchWeddings();
  }, []);

  const checkUserAndFetchWeddings = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    await fetchWeddings();
  };

  const fetchWeddings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("weddings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWeddings(data || []);
    } catch (error) {
      console.error("Error fetching weddings:", error);
      toast({
        title: "Error",
        description: "Failed to load your events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("weddings")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
      
      setWeddings(weddings.filter(w => w.id !== id));
    } catch (error) {
      console.error("Error deleting wedding:", error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
    setDeleteId(null);
  };

  const handlePublish = async (id: string) => {
    try {
      const { error } = await supabase
        .from("weddings")
        .update({ status: 'published' })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event published successfully! You can now generate invitation links.",
      });
      
      // Update local state
      setWeddings(weddings.map(w => 
        w.id === id ? { ...w, status: 'published' } : w
      ));
    } catch (error) {
      console.error("Error publishing wedding:", error);
      toast({
        title: "Error",
        description: "Failed to publish event",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedWeddingId || !selectedWeddingSlug) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('weddingId', selectedWeddingId);
      formData.append('weddingSlug', selectedWeddingSlug);

      const response = await fetch('https://aurea-invites.app.n8n.cloud/webhook-test/read-invitees-csv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file to workflow');
      }

      toast({
        title: "Success",
        description: "File uploaded successfully. Links are being generated automatically.",
      });

      setGenerateOptionsOpen(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">
              My Events
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate("/dashboard/select-event-type")}>
              Create Event
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your events...</p>
          </div>
        ) : weddings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold mb-2">No Events Yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first event invitation to get started
            </p>
            <Button onClick={() => navigate("/dashboard/select-event-type")}>
              Create Event
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupEventsByType(weddings)).map(([eventType, events]) => (
              events.length > 0 && (
                <section key={eventType}>
                  <div className="mb-6">
                    <h2 className="text-2xl font-serif font-bold text-foreground">
                      {eventType}s
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {events.filter(e => e.status === 'published').length} published, {events.filter(e => e.status === 'draft').length} draft
                    </p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((wedding) => (
                      <Card key={wedding.id} className={`shadow-soft hover:shadow-elegant transition-all relative ${wedding.status === 'published' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-amber-500'}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-1">
                              <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                                {getEventType(wedding.template_type)}
                              </span>
                            </div>
                            <CardTitle className="text-xl font-serif">
                              {wedding.bride_name} & {wedding.groom_name}
                            </CardTitle>
                            <CardDescription>
                              {new Date(wedding.wedding_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </CardDescription>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${wedding.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${wedding.status === 'published' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                            {wedding.status === 'published' ? 'Live' : 'Draft'}
                          </span>
                        </div>
                      </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {wedding.status === 'draft' && (
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
                        <p className="font-medium">Not published yet</p>
                        <p className="text-xs mt-1">Edit and publish to generate invitation links</p>
                      </div>
                    )}

                    {wedding.status === 'draft' && (
                      <Button 
                        className="w-full" 
                        onClick={() => handlePublish(wedding.id)}
                      >
                        Publish Event
                      </Button>
                    )}

                    {wedding.status === 'published' && (
                      <>
                        {!wedding.template_type?.includes('bachelor') ? (
                          <>
                            <Button
                              variant="outline"
                              className="w-full flex items-center justify-between"
                              onClick={() => {
                                setSelectedWeddingId(wedding.id);
                                setSelectedWeddingSlug(wedding.slug);
                                setGenerateOptionsOpen(true);
                              }}
                            >
                              <span>Generate Invitation Link</span>
                              <Link2 className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="outline"
                              className="w-full flex items-center justify-between"
                              onClick={() => navigate(`/dashboard/manage-links/${wedding.id}`)}
                            >
                              <span>Manage invitation Links</span>
                              <List className="w-4 h-4" />
                            </Button>
                          </>
                        ) : wedding.main_picture_url ? (
                          <div className="relative rounded-lg overflow-hidden border border-border">
                            <img 
                              src={wedding.main_picture_url} 
                              alt="Bachelor party card"
                              className="w-full h-48 object-cover"
                            />
                          </div>
                        ) : null}
                      </>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          let editPath = `/dashboard/edit/${wedding.id}`;
                          if (wedding.template_type?.includes('bachelor')) {
                            editPath = `/dashboard/edit-bachelor/${wedding.id}`;
                          } else if (wedding.template_type?.includes('christmas')) {
                            editPath = `/dashboard/edit-christmas/${wedding.id}`;
                          }
                          navigate(editPath);
                        }}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {wedding.status === 'published' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`/invite/${wedding.slug}`, '_blank')}
                          title="View Invitation"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(wedding.id)}
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                    </CardContent>
                  </Card>
                  ))}
                </div>
              </section>
              )
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your event
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={generateOptionsOpen} onOpenChange={setGenerateOptionsOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Invitation Links</DialogTitle>
            <DialogDescription>
              Choose how you'd like to generate invitation links
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Generation</TabsTrigger>
              <TabsTrigger value="automated">Automated Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4">
              <div className="py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Manually create individual invitation links with specific guests
                </p>
                <Button 
                  onClick={() => {
                    setGenerateOptionsOpen(false);
                    setGenerateLinkOpen(true);
                  }}
                  className="w-full"
                >
                  Create Manual Link
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="automated" className="space-y-4">
              <div className="py-4 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Upload CSV or XLSX File</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a CSV or Excel file containing your guest list. The file will be processed automatically by our workflow.
                  </p>
                </div>

                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <input
                    type="file"
                    id="file-upload"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploadingFile}
                  />
                  
                  {uploadingFile ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="w-12 h-12 text-primary animate-spin" />
                      <p className="text-sm text-muted-foreground">Uploading and processing file...</p>
                    </div>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-semibold mb-2">
                        Drag and drop your file here
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        or
                      </p>
                      <Button
                        onClick={() => document.getElementById('file-upload')?.click()}
                        variant="outline"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Browse Files
                      </Button>
                      <p className="text-xs text-muted-foreground mt-4">
                        Supported formats: CSV, XLSX
                      </p>
                    </>
                  )}
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="text-sm font-semibold mb-2">File Format Requirements:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    <li>CSV or XLSX format</li>
                    <li>Include columns for: Link Name, Slug, Guest Names</li>
                    <li>One row per invitation link</li>
                    <li>Separate multiple guests with commas or use multiple columns</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {selectedWeddingId && selectedWeddingSlug && (
        <GenerateLinkDialog
          open={generateLinkOpen}
          onOpenChange={setGenerateLinkOpen}
          weddingId={selectedWeddingId}
          weddingSlug={selectedWeddingSlug}
          onSuccess={() => {
            toast({
              title: "Success",
              description: "Link created successfully! Navigate to Manage Links to view it.",
            });
          }}
        />
      )}
    </div>
  );
};

export default MyEvents;

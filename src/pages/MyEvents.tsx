import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowLeft, Edit, Trash2, ExternalLink, Link2 } from "lucide-react";
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
}

const MyEvents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [generateLinkOpen, setGenerateLinkOpen] = useState(false);
  const [selectedWeddingId, setSelectedWeddingId] = useState<string | null>(null);
  const [selectedWeddingSlug, setSelectedWeddingSlug] = useState<string | null>(null);

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
            {/* Published Events Section */}
            {weddings.filter(w => w.status === 'published').length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Published Invitations
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Live invitations ready to share with guests
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {weddings.filter(w => w.status === 'published').map((wedding) => (
                    <Card key={wedding.id} className="shadow-soft hover:shadow-elegant transition-all relative border-l-4 border-l-green-500">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
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
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            Live
                          </span>
                        </div>
                      </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {wedding.status === 'published' && (
                      <>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setSelectedWeddingId(wedding.id);
                            setSelectedWeddingSlug(wedding.slug);
                            setGenerateLinkOpen(true);
                          }}
                        >
                          <Link2 className="w-4 h-4 mr-2" />
                          Generate Invitation Link
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate(`/dashboard/manage-links/${wedding.id}`)}
                        >
                          Manage invitation Links
                        </Button>
                      </>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/dashboard/edit/${wedding.id}`)}
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
            )}

            {/* Draft Events Section */}
            {weddings.filter(w => w.status === 'draft').length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    Draft Invitations
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Complete and publish these invitations to share with guests
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {weddings.filter(w => w.status === 'draft').map((wedding) => (
                    <Card key={wedding.id} className="shadow-soft hover:shadow-elegant transition-all relative border-l-4 border-l-yellow-500 bg-yellow-50/30">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
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
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                            Draft
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
                            <p className="font-medium">Not published yet</p>
                            <p className="text-xs mt-1">Edit and publish to generate invitation links</p>
                          </div>

                          <Button 
                            className="w-full" 
                            onClick={() => handlePublish(wedding.id)}
                          >
                            Publish Event
                          </Button>

                          <div className="flex justify-end gap-2 pt-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/dashboard/edit/${wedding.id}`)}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
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
            )}
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

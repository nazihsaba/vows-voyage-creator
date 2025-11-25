import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowLeft, Edit, Trash2, ExternalLink, Link2, List, Download } from "lucide-react";
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
  if (templateType?.includes("bachelor")) return "Bachelor Party";
  if (templateType?.includes("christmas") || templateType?.includes("birthday")) return "Christmas Dinner";
  return "Wedding";
};

const groupEventsByType = (events: Wedding[]) => {
  const grouped: Record<string, Wedding[]> = {
    Wedding: [],
    "Bachelor Party": [],
    "Christmas Dinner": [],
  };

  events.forEach((event) => {
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
  const [selectedWeddingId, setSelectedWeddingId] = useState<string | null>(null);
  const [selectedWeddingSlug, setSelectedWeddingSlug] = useState<string | null>(null);

  useEffect(() => {
    checkUserAndFetchWeddings();
  }, []);

  const checkUserAndFetchWeddings = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    await fetchWeddings();
  };

  const fetchWeddings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
      const { error } = await supabase.from("weddings").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event deleted successfully",
      });

      setWeddings(weddings.filter((w) => w.id !== id));
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
      const { error } = await supabase.from("weddings").update({ status: "published" }).eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event published successfully! You can now generate invitation links.",
      });

      // Update local state
      setWeddings(weddings.map((w) => (w.id === id ? { ...w, status: "published" } : w)));
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
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">My Events</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate("/dashboard/select-event-type")}>Create Event</Button>
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
            <p className="text-muted-foreground mb-6">Create your first event invitation to get started</p>
            <Button onClick={() => navigate("/dashboard/select-event-type")}>Create Event</Button>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupEventsByType(weddings)).map(
              ([eventType, events]) =>
                events.length > 0 && (
                  <section key={eventType}>
                    <div className="mb-6">
                      <h2 className="text-2xl font-serif font-bold text-foreground">{eventType}s</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {events.filter((e) => e.status === "published").length} published,{" "}
                        {events.filter((e) => e.status === "draft").length} draft
                      </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {events.map((wedding) => (
                        <Card
                          key={wedding.id}
                          className={`group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-background via-background to-muted/40 shadow-sm hover:-translate-y-0.5 hover:shadow-xl transition-all ${
                            wedding.status === "published"
                              ? "border-l-4 border-l-emerald-500"
                              : "border-l-4 border-l-amber-500"
                          }`}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                                    {getEventType(wedding.template_type)}
                                  </span>
                                </div>

                                <CardTitle className="text-2xl font-serif tracking-tight">
                                  {wedding.bride_name} &amp; {wedding.groom_name}
                                </CardTitle>

                                <CardDescription className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                  <span className="inline-flex items-center rounded-full bg-background/80 px-2.5 py-1">
                                    {new Date(wedding.wedding_date).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </span>
                                </CardDescription>
                              </div>

                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                                  wedding.status === "published"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-amber-200 bg-amber-50 text-amber-700"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    wedding.status === "published" ? "bg-emerald-500" : "bg-amber-500"
                                  }`}
                                />
                                {wedding.status === "published" ? "Live Invitation" : "Draft"}
                              </span>
                            </div>
                          </CardHeader>

                          <CardContent className="pb-4">
                            <div className="space-y-4">
                              {/* Draft notice */}
                              {wedding.status === "draft" && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-sm text-amber-900">
                                  <p className="font-medium">Not published yet</p>
                                  <p className="mt-1 text-xs text-amber-800/90">
                                    Edit the details and publish to generate your invitation link.
                                  </p>
                                </div>
                              )}

                              {/* Draft publish button */}
                              {wedding.status === "draft" && (
                                <Button
                                  className="w-full rounded-xl font-medium"
                                  onClick={() => handlePublish(wedding.id)}
                                >
                                  Publish Event
                                </Button>
                              )}

                              {/* Published actions / bachelor preview */}
                              {wedding.status === "published" && (
                                <>
                                  {!wedding.template_type?.includes("bachelor") ? (
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                      <Button
                                        variant="outline"
                                        className="flex w-full items-center justify-between rounded-xl border-dashed"
                                        onClick={() => {
                                          setSelectedWeddingId(wedding.id);
                                          setSelectedWeddingSlug(wedding.slug);
                                          setGenerateLinkOpen(true);
                                        }}
                                      >
                                        <span className="text-sm font-medium">Generate Invitation Link</span>
                                        <Link2 className="h-4 w-4" />
                                      </Button>

                                      <Button
                                        variant="outline"
                                        className="flex w-full items-center justify-between rounded-xl"
                                        onClick={() => navigate(`/dashboard/manage-links/${wedding.id}`)}
                                      >
                                        <span className="text-sm font-medium">Manage Invitation Links</span>
                                        <List className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ) : wedding.main_picture_url ? (
                                    <div className="relative overflow-hidden rounded-xl border border-border/70 bg-background/60">
                                      <img
                                        src={wedding.main_picture_url}
                                        alt="Bachelor party card"
                                        className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                      />
                                    </div>
                                  ) : null}
                                </>
                              )}

                              {/* Footer actions */}
                              <div className="mt-2 flex items-center justify-end gap-1.5 border-t border-dashed border-border/60 pt-3">
                                <div className="inline-flex items-center gap-1 rounded-full bg-muted/70 px-2 py-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => {
                                      let editPath = `/dashboard/edit/${wedding.id}`;

                                      if (wedding.template_type?.includes("bachelor")) {
                                        editPath = `/dashboard/edit-bachelor/${wedding.id}`;
                                      } else if (wedding.template_type?.includes("christmas")) {
                                        editPath = `/dashboard/edit-christmas/${wedding.id}`;
                                      } else if (wedding.template_type === "rose-gold-tabs") {
                                        editPath = `/dashboard/edit-rose-gold-tabs/${wedding.id}`;
                                      }

                                      navigate(editPath);
                                    }}
                                    title="Edit"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>

                                  {wedding.status === "published" && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-full"
                                      onClick={() => window.open(`/invite/${wedding.slug}`, "_blank")}
                                      title="View Invitation"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  )}

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteId(wedding.id)}
                                    title="Delete"
                                    className="h-8 w-8 rounded-full text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                ),
            )}
          </div>
        )}
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your event and all associated data.
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

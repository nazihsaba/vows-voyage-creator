import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Heart, Plus, LogOut, Loader2, ExternalLink, Copy, Eye, Trash2, PartyPopper } from "lucide-react";
import { format } from "date-fns";
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

const Dashboard = () => {
  const [weddings, setWeddings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    fetchWeddings();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchWeddings = async () => {
    try {
      const { data, error } = await supabase
        .from("weddings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWeddings(data || []);
    } catch (error) {
      console.error("Error fetching weddings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const copyInviteLink = (slug: string) => {
    const link = `${window.location.origin}/invite/${slug}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "Invitation link copied to clipboard.",
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("weddings")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setWeddings(weddings.filter(w => w.id !== id));
      toast({
        title: "Event deleted",
        description: "Your event has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting wedding:", error);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PartyPopper className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">
              My Events
            </h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card 
            className="shadow-soft hover:shadow-elegant transition-all cursor-pointer"
            onClick={() => navigate("/dashboard/select-event-type")}
          >
            <CardContent className="p-8 text-center">
              <Plus className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-serif font-semibold mb-2">Add Event</h2>
              <p className="text-muted-foreground">
                Create a new event invitation
              </p>
            </CardContent>
          </Card>

          <Card 
            className="shadow-soft hover:shadow-elegant transition-all cursor-pointer"
            onClick={() => {
              // Scroll to events list
              document.getElementById("events-list")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <CardContent className="p-8 text-center">
              <PartyPopper className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-serif font-semibold mb-2">My Events</h2>
              <p className="text-muted-foreground">
                View and manage your events
              </p>
            </CardContent>
          </Card>
        </div>

        <div id="events-list">
          <h2 className="text-2xl font-serif font-semibold mb-6">All Events</h2>
          {weddings.length === 0 ? (
            <Card className="shadow-soft">
              <CardContent className="p-12 text-center">
                <PartyPopper className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-serif font-semibold mb-2">No events yet</h3>
                <p className="text-muted-foreground">
                  Your created events will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {weddings.map((wedding) => (
              <Card key={wedding.id} className="shadow-soft hover:shadow-elegant transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-serif">
                        {wedding.groom_name} & {wedding.bride_name}
                      </CardTitle>
                      <CardDescription>
                        {format(new Date(wedding.wedding_date), "MMMM dd, yyyy")}
                      </CardDescription>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      wedding.status === "published" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {wedding.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/dashboard/edit/${wedding.id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/invite/${wedding.slug}?preview=true`, "_blank")}
                      title="Preview invitation"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {wedding.status === "published" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyInviteLink(wedding.slug)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={`/invite/${wedding.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingId(wedding.id)}
                      title="Delete event"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          )}
        </div>
      </main>

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingId && handleDelete(deletingId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
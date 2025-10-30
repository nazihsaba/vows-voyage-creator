import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowLeft, Edit, Trash2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
      const { data, error } = await supabase
        .from("weddings")
        .select("*")
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
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Templates
          </Button>
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
            <Button onClick={() => navigate("/dashboard")}>
              Create Event
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {weddings.map((wedding) => (
              <Card key={wedding.id} className="shadow-soft hover:shadow-elegant transition-all">
                <CardHeader>
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
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      wedding.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {wedding.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/dashboard/edit/${wedding.id}`)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    {wedding.status === 'published' && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(`/invite/${wedding.slug}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Invitation
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(wedding.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
    </div>
  );
};

export default MyEvents;

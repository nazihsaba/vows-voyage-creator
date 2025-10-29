import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Heart, Plus, LogOut, Loader2, ExternalLink, Copy, Eye } from "lucide-react";
import { format } from "date-fns";

const Dashboard = () => {
  const [weddings, setWeddings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
            <Heart className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">
              My Weddings
            </h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            onClick={() => navigate("/dashboard/create")}
            className="bg-primary hover:bg-primary-hover"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Wedding Invitation
          </Button>
        </div>

        {weddings.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="p-12 text-center">
              <Heart className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
              <h2 className="text-2xl font-serif font-semibold mb-2">No invitations yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first wedding invitation to get started
              </p>
              <Button onClick={() => navigate("/dashboard/create")}>
                Create Invitation
              </Button>
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
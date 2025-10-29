import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Eye } from "lucide-react";

const WeddingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    groom_name: "",
    bride_name: "",
    groom_family: "",
    bride_family: "",
    wedding_date: "",
    main_description: "",
    slug: "",
    status: "draft",
  });

  useEffect(() => {
    if (id) {
      fetchWedding();
    }
  }, [id]);

  const fetchWedding = async () => {
    try {
      const { data, error } = await supabase
        .from("weddings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setFormData(data);
    } catch (error) {
      console.error("Error fetching wedding:", error);
    }
  };

  const generateSlug = (groomName: string, brideName: string) => {
    return `${groomName}-${brideName}`.toLowerCase().replace(/\s+/g, "-");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const slug = formData.slug || generateSlug(formData.groom_name, formData.bride_name);

      if (id) {
        const { error } = await supabase
          .from("weddings")
          .update({ ...formData, slug })
          .eq("id", id);

        if (error) throw error;
        toast({ title: "Wedding updated successfully!" });
      } else {
        const { error } = await supabase
          .from("weddings")
          .insert([{ ...formData, slug, user_id: user.id }]);

        if (error) throw error;
        toast({ title: "Wedding created successfully!" });
      }

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-3xl font-serif">
              {id ? "Edit Wedding" : "Create Wedding Invitation"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="groom_name">Groom Name *</Label>
                  <Input
                    id="groom_name"
                    value={formData.groom_name}
                    onChange={(e) => setFormData({ ...formData, groom_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bride_name">Bride Name *</Label>
                  <Input
                    id="bride_name"
                    value={formData.bride_name}
                    onChange={(e) => setFormData({ ...formData, bride_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="groom_family">Groom's Family</Label>
                  <Input
                    id="groom_family"
                    value={formData.groom_family}
                    onChange={(e) => setFormData({ ...formData, groom_family: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bride_family">Bride's Family</Label>
                  <Input
                    id="bride_family"
                    value={formData.bride_family}
                    onChange={(e) => setFormData({ ...formData, bride_family: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wedding_date">Wedding Date *</Label>
                <Input
                  id="wedding_date"
                  type="date"
                  value={formData.wedding_date}
                  onChange={(e) => setFormData({ ...formData, wedding_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="main_description">Description</Label>
                <Textarea
                  id="main_description"
                  value={formData.main_description}
                  onChange={(e) => setFormData({ ...formData, main_description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Custom URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g., john-jane-2024"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : id ? "Update" : "Create"}
                </Button>
                {formData.slug && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.open(`/invite/${formData.slug}?preview=true`, "_blank")}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData({ ...formData, status: formData.status === "published" ? "draft" : "published" })}
                >
                  {formData.status === "published" ? "Unpublish" : "Publish"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeddingForm;
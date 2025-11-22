import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Heart, ArrowLeft } from "lucide-react";

export default function RoseGoldTabsForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    groomName: "",
    brideName: "",
    weddingDate: "",
    rsvpDeadline: "",
    welcomingText: "Together with their families,",
    invitationText: "kindly request the pleasure of your company to celebrate their wedding.",
    middleText: "Join us for an evening of love, joy, and celebration.",
    closingMessage: "",
  });

  const [ceremonyLocation, setCeremonyLocation] = useState({
    locationName: "",
    locationLink: "",
    time: "",
  });

  const [receptionLocation, setReceptionLocation] = useState({
    locationName: "",
    locationLink: "",
    time: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const slug = `${formData.groomName.toLowerCase()}-${formData.brideName.toLowerCase()}-${Date.now()}`.replace(/\s+/g, '-');

      const { data: wedding, error: weddingError } = await supabase
        .from("weddings")
        .insert({
          user_id: user.id,
          groom_name: formData.groomName,
          bride_name: formData.brideName,
          wedding_date: formData.weddingDate,
          rsvp_deadline: formData.rsvpDeadline || null,
          welcoming_text: formData.welcomingText,
          invitation_text: formData.invitationText,
          middle_text: formData.middleText,
          closing_message: formData.closingMessage || `Kindly confirm your presence by ${formData.rsvpDeadline}.`,
          slug,
          template_type: "rose-gold-tabs",
          status: "draft",
        })
        .select()
        .single();

      if (weddingError) throw weddingError;

      // Add ceremony location if provided
      if (ceremonyLocation.locationName) {
        const { error: ceremonyError } = await supabase
          .from("wedding_locations")
          .insert({
            wedding_id: wedding.id,
            type: "ceremony",
            location_name: ceremonyLocation.locationName,
            location_link: ceremonyLocation.locationLink || null,
            time: ceremonyLocation.time || null,
          });

        if (ceremonyError) throw ceremonyError;
      }

      // Add reception location if provided
      if (receptionLocation.locationName) {
        const { error: receptionError } = await supabase
          .from("wedding_locations")
          .insert({
            wedding_id: wedding.id,
            type: "reception",
            location_name: receptionLocation.locationName,
            location_link: receptionLocation.locationLink || null,
            time: receptionLocation.time || null,
          });

        if (receptionError) throw receptionError;
      }

      toast.success("Wedding invitation created successfully!");
      navigate(`/invite/preview?weddingId=${wedding.id}`);
    } catch (error: any) {
      console.error("Error creating wedding:", error);
      toast.error(error.message || "Failed to create wedding invitation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="bg-white shadow-soft sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-rose-500" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-primary">
                Rose Gold Tabs Wedding
              </h1>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard/wedding-templates")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the couple's details and wedding date</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="groomName">Groom's Name *</Label>
                  <Input
                    id="groomName"
                    value={formData.groomName}
                    onChange={(e) => setFormData({ ...formData, groomName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brideName">Bride's Name *</Label>
                  <Input
                    id="brideName"
                    value={formData.brideName}
                    onChange={(e) => setFormData({ ...formData, brideName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weddingDate">Wedding Date *</Label>
                  <Input
                    id="weddingDate"
                    type="date"
                    value={formData.weddingDate}
                    onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rsvpDeadline">RSVP Deadline</Label>
                  <Input
                    id="rsvpDeadline"
                    type="date"
                    value={formData.rsvpDeadline}
                    onChange={(e) => setFormData({ ...formData, rsvpDeadline: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invitation Text</CardTitle>
              <CardDescription>Customize the invitation messages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="welcomingText">Welcoming Text</Label>
                <Input
                  id="welcomingText"
                  value={formData.welcomingText}
                  onChange={(e) => setFormData({ ...formData, welcomingText: e.target.value })}
                  placeholder="Together with their families,"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invitationText">Invitation Text</Label>
                <Textarea
                  id="invitationText"
                  value={formData.invitationText}
                  onChange={(e) => setFormData({ ...formData, invitationText: e.target.value })}
                  placeholder="kindly request the pleasure of your company to celebrate their wedding."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="middleText">Middle Text</Label>
                <Textarea
                  id="middleText"
                  value={formData.middleText}
                  onChange={(e) => setFormData({ ...formData, middleText: e.target.value })}
                  placeholder="Join us for an evening of love, joy, and celebration."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ceremony Location</CardTitle>
              <CardDescription>Add ceremony venue details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ceremonyLocationName">Location Name</Label>
                <Input
                  id="ceremonyLocationName"
                  value={ceremonyLocation.locationName}
                  onChange={(e) => setCeremonyLocation({ ...ceremonyLocation, locationName: e.target.value })}
                  placeholder="e.g., St. Mary's Church"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ceremonyTime">Time</Label>
                <Input
                  id="ceremonyTime"
                  type="time"
                  value={ceremonyLocation.time}
                  onChange={(e) => setCeremonyLocation({ ...ceremonyLocation, time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ceremonyLocationLink">Location Link (Google Maps)</Label>
                <Input
                  id="ceremonyLocationLink"
                  value={ceremonyLocation.locationLink}
                  onChange={(e) => setCeremonyLocation({ ...ceremonyLocation, locationLink: e.target.value })}
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reception Location</CardTitle>
              <CardDescription>Add reception venue details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="receptionLocationName">Location Name</Label>
                <Input
                  id="receptionLocationName"
                  value={receptionLocation.locationName}
                  onChange={(e) => setReceptionLocation({ ...receptionLocation, locationName: e.target.value })}
                  placeholder="e.g., Grand Ballroom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receptionTime">Time</Label>
                <Input
                  id="receptionTime"
                  type="time"
                  value={receptionLocation.time}
                  onChange={(e) => setReceptionLocation({ ...receptionLocation, time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receptionLocationLink">Location Link (Google Maps)</Label>
                <Input
                  id="receptionLocationLink"
                  value={receptionLocation.locationLink}
                  onChange={(e) => setReceptionLocation({ ...receptionLocation, locationLink: e.target.value })}
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/dashboard/wedding-templates")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Invitation"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

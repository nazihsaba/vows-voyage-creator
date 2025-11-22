import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function ElegantTabsForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    groomName: "",
    brideName: "",
    weddingDate: "",
    rsvpDeadline: "",
    eventTitle: "Wedding Invitation",
    welcomingText: "Together with their families,",
    mainDescription: "kindly request the pleasure of your company to celebrate their wedding.",
    middleText: "Join us for an evening of love, joy, and celebration.",
    closingMessage: "",
    ceremonyLocationName: "",
    ceremonyLocationLink: "",
    ceremonyTime: "",
    venueLocationName: "",
    venueLocationLink: "",
    venueTime: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to create an invitation");
        navigate("/auth");
        return;
      }

      const slug = `${formData.groomName.toLowerCase()}-${formData.brideName.toLowerCase()}-${Date.now()}`.replace(/\s+/g, "-");

      const { data: wedding, error: weddingError } = await supabase
        .from("weddings")
        .insert({
          user_id: user.id,
          groom_name: formData.groomName,
          bride_name: formData.brideName,
          wedding_date: formData.weddingDate,
          rsvp_deadline: formData.rsvpDeadline || null,
          event_title: formData.eventTitle,
          welcoming_text: formData.welcomingText,
          main_description: formData.mainDescription,
          middle_text: formData.middleText,
          closing_message: formData.closingMessage || `Kindly confirm your presence by ${formData.rsvpDeadline}.`,
          slug,
          template_type: "elegant-tabs",
          status: "draft",
        })
        .select()
        .single();

      if (weddingError) throw weddingError;

      const locations = [];
      
      if (formData.ceremonyLocationName || formData.ceremonyTime) {
        locations.push({
          wedding_id: wedding.id,
          type: "ceremony",
          location_name: formData.ceremonyLocationName || null,
          location_link: formData.ceremonyLocationLink || null,
          time: formData.ceremonyTime || null,
        });
      }

      if (formData.venueLocationName || formData.venueTime) {
        locations.push({
          wedding_id: wedding.id,
          type: "venue",
          location_name: formData.venueLocationName || null,
          location_link: formData.venueLocationLink || null,
          time: formData.venueTime || null,
        });
      }

      if (locations.length > 0) {
        const { error: locationsError } = await supabase
          .from("wedding_locations")
          .insert(locations);

        if (locationsError) throw locationsError;
      }

      toast.success("Invitation created successfully!");
      navigate(`/wedding/${slug}`);
    } catch (error: any) {
      console.error("Error creating invitation:", error);
      toast.error(error.message || "Failed to create invitation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-amber-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="border-rose-200 shadow-lg">
          <CardHeader className="border-b border-rose-100">
            <CardTitle className="text-2xl text-rose-600">
              Create Elegant Tabs Invitation
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="groomName">Groom's Name *</Label>
                  <Input
                    id="groomName"
                    required
                    value={formData.groomName}
                    onChange={(e) => setFormData({ ...formData, groomName: e.target.value })}
                    placeholder="Enter groom's name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brideName">Bride's Name *</Label>
                  <Input
                    id="brideName"
                    required
                    value={formData.brideName}
                    onChange={(e) => setFormData({ ...formData, brideName: e.target.value })}
                    placeholder="Enter bride's name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weddingDate">Wedding Date *</Label>
                  <Input
                    id="weddingDate"
                    type="date"
                    required
                    value={formData.weddingDate}
                    onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
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

              <div className="space-y-2">
                <Label htmlFor="eventTitle">Event Title</Label>
                <Input
                  id="eventTitle"
                  value={formData.eventTitle}
                  onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
                  placeholder="Wedding Invitation"
                />
              </div>

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
                <Label htmlFor="mainDescription">Main Description</Label>
                <Textarea
                  id="mainDescription"
                  value={formData.mainDescription}
                  onChange={(e) => setFormData({ ...formData, mainDescription: e.target.value })}
                  placeholder="kindly request the pleasure of your company..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="middleText">Additional Message</Label>
                <Input
                  id="middleText"
                  value={formData.middleText}
                  onChange={(e) => setFormData({ ...formData, middleText: e.target.value })}
                  placeholder="Join us for an evening of love..."
                />
              </div>

              <div className="border-t border-rose-100 pt-6">
                <h3 className="text-lg font-semibold text-rose-600 mb-4">Ceremony Location</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ceremonyLocationName">Ceremony Venue Name</Label>
                    <Input
                      id="ceremonyLocationName"
                      value={formData.ceremonyLocationName}
                      onChange={(e) => setFormData({ ...formData, ceremonyLocationName: e.target.value })}
                      placeholder="e.g., St. Mary's Church"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ceremonyLocationLink">Ceremony Map Link</Label>
                    <Input
                      id="ceremonyLocationLink"
                      type="url"
                      value={formData.ceremonyLocationLink}
                      onChange={(e) => setFormData({ ...formData, ceremonyLocationLink: e.target.value })}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ceremonyTime">Ceremony Time</Label>
                    <Input
                      id="ceremonyTime"
                      type="time"
                      value={formData.ceremonyTime}
                      onChange={(e) => setFormData({ ...formData, ceremonyTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-rose-100 pt-6">
                <h3 className="text-lg font-semibold text-rose-600 mb-4">Reception Venue</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="venueLocationName">Venue Name</Label>
                    <Input
                      id="venueLocationName"
                      value={formData.venueLocationName}
                      onChange={(e) => setFormData({ ...formData, venueLocationName: e.target.value })}
                      placeholder="e.g., Grand Hotel Ballroom"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="venueLocationLink">Venue Map Link</Label>
                    <Input
                      id="venueLocationLink"
                      type="url"
                      value={formData.venueLocationLink}
                      onChange={(e) => setFormData({ ...formData, venueLocationLink: e.target.value })}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="venueTime">Reception Time</Label>
                    <Input
                      id="venueTime"
                      type="time"
                      value={formData.venueTime}
                      onChange={(e) => setFormData({ ...formData, venueTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-rose-400 hover:bg-rose-500"
                disabled={isLoading}
              >
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Creating..." : "Create Invitation"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const MultipageSlideshowForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    groomName: '',
    brideName: '',
    weddingDate: '',
    slug: '',
    mainDescription: '',
    ceremonyLocation: '',
    ceremonyTime: '',
    venueLocation: '',
    venueTime: '',
    closingMessage: '',
  });

  const generateSlug = (groomName: string, brideName: string) => {
    return `${groomName}-${brideName}`.toLowerCase().replace(/\s+/g, '-');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to create an invitation',
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }

      const slug = formData.slug || generateSlug(formData.groomName, formData.brideName);

      // Create the wedding
      const { data: wedding, error: weddingError } = await supabase
        .from('weddings')
        .insert({
          groom_name: formData.groomName,
          bride_name: formData.brideName,
          wedding_date: formData.weddingDate,
          slug,
          main_description: formData.mainDescription,
          closing_message: formData.closingMessage,
          user_id: user.id,
          template_type: 'multipage-slideshow',
        })
        .select()
        .single();

      if (weddingError) throw weddingError;

      // Create ceremony location if provided
      if (formData.ceremonyLocation) {
        const { error: ceremonyError } = await supabase
          .from('wedding_locations')
          .insert({
            wedding_id: wedding.id,
            type: 'ceremony',
            location_name: formData.ceremonyLocation,
            time: formData.ceremonyTime,
          });

        if (ceremonyError) throw ceremonyError;
      }

      // Create venue location if provided
      if (formData.venueLocation) {
        const { error: venueError } = await supabase
          .from('wedding_locations')
          .insert({
            wedding_id: wedding.id,
            type: 'venue',
            location_name: formData.venueLocation,
            time: formData.venueTime,
          });

        if (venueError) throw venueError;
      }

      toast({
        title: 'Success!',
        description: 'Your invitation has been created',
      });

      navigate(`/dashboard/my-events`);
    } catch (error: any) {
      console.error('Error creating invitation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create invitation',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2">Multipage Slideshow Invitation</h1>
          <p className="text-muted-foreground text-center mb-8">
            Create a stunning multi-page invitation with slideshow backgrounds
          </p>

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
              <Label htmlFor="mainDescription">Your Story</Label>
              <Textarea
                id="mainDescription"
                value={formData.mainDescription}
                onChange={(e) => setFormData({ ...formData, mainDescription: e.target.value })}
                placeholder="Tell your love story..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ceremonyLocation">Ceremony Location</Label>
                <Input
                  id="ceremonyLocation"
                  value={formData.ceremonyLocation}
                  onChange={(e) => setFormData({ ...formData, ceremonyLocation: e.target.value })}
                  placeholder="Church name or address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ceremonyTime">Ceremony Time</Label>
                <Input
                  id="ceremonyTime"
                  value={formData.ceremonyTime}
                  onChange={(e) => setFormData({ ...formData, ceremonyTime: e.target.value })}
                  placeholder="3:00 PM"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="venueLocation">Reception Venue</Label>
                <Input
                  id="venueLocation"
                  value={formData.venueLocation}
                  onChange={(e) => setFormData({ ...formData, venueLocation: e.target.value })}
                  placeholder="Venue name or address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="venueTime">Reception Time</Label>
                <Input
                  id="venueTime"
                  value={formData.venueTime}
                  onChange={(e) => setFormData({ ...formData, venueTime: e.target.value })}
                  placeholder="6:00 PM"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="closingMessage">Closing Message</Label>
              <Textarea
                id="closingMessage"
                value={formData.closingMessage}
                onChange={(e) => setFormData({ ...formData, closingMessage: e.target.value })}
                placeholder="We cannot wait to celebrate with you!"
                rows={2}
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
              <p className="text-xs text-muted-foreground">
                Leave empty to auto-generate from names
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Invitation'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MultipageSlideshowForm;

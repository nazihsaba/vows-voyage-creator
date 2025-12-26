import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Heart,
  LogOut,
  Calendar,
  Video,
  Images,
  MapPin,
  Gift as GiftIcon,
  Clock,
  GlassWater,
  Sparkles,
  UserCog,
  Eye,
  X,
  LayoutGrid,
} from "lucide-react";
import modernRomance from "@/assets/template-modern-romance.jpg";
import cinematicVideo from "@/assets/template-cinematic-video.jpg";
import roseGoldTabs from "@/assets/template-rose-gold-tabs.jpg";
import { ModernRomancePreview } from "@/components/templates/ModernRomancePreview";
import { VideoBackgroundPreview } from "@/components/templates/VideoBackgroundPreview";
import { RoseGoldTabsPreview } from "@/components/templates/RoseGoldTabsPreview";

const Dashboard = () => {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const weddingTemplates = [
    {
      id: "template2",
      name: "Modern Romance",
      description: "Contemporary design with stunning gallery showcase",
      image: modernRomance,
      features: [
        { icon: Images, text: "Photo Gallery" },
        { icon: MapPin, text: "Event Locations" },
        { icon: GiftIcon, text: "Gift Registry" },
        { icon: Clock, text: "Countdown Timer" },
      ],
    },
    {
      id: "template6",
      name: "Cinematic Video",
      description: "Immersive full-screen video background experience",
      image: cinematicVideo,
      features: [
        { icon: Video, text: "Video Background" },
        { icon: MapPin, text: "Event Locations" },
        { icon: GiftIcon, text: "Gift Registry" },
        { icon: Clock, text: "Countdown Timer" },
      ],
    },
    {
      id: "rose-gold-tabs",
      name: "Rose Gold Tabs",
      description: "Fullscreen video background with elegant page transitions",
      image: roseGoldTabs,
      features: [
        { icon: Video, text: "Video Background" },
        { icon: Sparkles, text: "Page Transitions" },
        { icon: MapPin, text: "Event Locations" },
        { icon: Clock, text: "Countdown Timer" },
      ],
    },
    {
      id: "gallery-grid",
      name: "Gallery Grid",
      description: "Elegant design with all photos displayed together in a beautiful grid",
      image: modernRomance,
      features: [
        { icon: LayoutGrid, text: "Grid Gallery" },
        { icon: Images, text: "All Photos Together" },
        { icon: MapPin, text: "Event Locations" },
        { icon: GiftIcon, text: "Gift Registry" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="bg-white shadow-soft sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-primary text-center sm:text-left">
                Choose Your Template
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Button onClick={() => navigate("/dashboard/my-events")} className="flex-1 sm:flex-none">
                My Events
              </Button>
              <Button variant="outline" onClick={handleLogout} className="flex-1 sm:flex-none">
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Exit</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard/settings")}
                title="Settings"
                className="rounded-full"
              >
                <UserCog className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-8 sm:space-y-12">
          {/* Weddings Section */}
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-rose-500" />
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Weddings</h2>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {weddingTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="shadow-soft hover:shadow-elegant transition-all flex flex-col"
                >
                  <CardHeader className="p-4 sm:p-6 flex-grow">
                    <div className="aspect-video rounded-lg overflow-hidden mb-3 sm:mb-4">
                      <img src={template.image} alt={template.name} className="w-full h-full object-cover" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-serif">{template.name}</CardTitle>
                    <CardDescription className="text-sm sm:text-base">{template.description}</CardDescription>

                    {template.features && (
                      <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
                        {template.features.map((feature, idx) => {
                          const FeatureIcon = feature.icon;
                          return (
                            <Badge key={idx} variant="secondary" className="text-xs flex items-center gap-1 py-1">
                              <FeatureIcon className="w-3 h-3" />
                              {feature.text}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 mt-auto space-y-2">
                    <Button
                      variant="outline"
                      className="w-full text-sm sm:text-base"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPreview(template.id);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      className="w-full text-sm sm:text-base"
                      onClick={() => {
                        if (template.id === "rose-gold-tabs") {
                          navigate(`/dashboard/rose-gold-tabs-form?template=${template.id}`);
                        } else {
                          navigate(`/dashboard/create?eventType=weddings&template=${template.id}`);
                        }
                      }}
                    >
                      Use This Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Bachelor Section - Coming Soon */}
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <GlassWater className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500" />
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Bachelor</h2>
              <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="shadow-soft opacity-50 flex flex-col">
                <CardHeader className="p-4 sm:p-6 flex-grow">
                  <div className="aspect-video rounded-lg overflow-hidden mb-3 sm:mb-4">
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 flex items-center justify-center">
                      <GlassWater className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-500 opacity-50" />
                    </div>
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-serif">Bachelor Template</CardTitle>
                  <CardDescription className="text-sm sm:text-base">Celebrate your bachelor party in style</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Preview Modal */}
      <Dialog open={showPreview !== null} onOpenChange={(open) => !open && setShowPreview(null)}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full p-0 overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>Preview of the selected wedding template</DialogDescription>
          </VisuallyHidden>
          <DialogHeader className="absolute top-4 right-4 z-50">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPreview(null)}
              className="bg-black/50 hover:bg-black/70 text-white rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </DialogHeader>
          <div className="w-full h-full overflow-y-auto">
            {showPreview === "template2" && <ModernRomancePreview />}
            {showPreview === "template6" && <VideoBackgroundPreview />}
            {showPreview === "rose-gold-tabs" && <RoseGoldTabsPreview />}
            {showPreview === "gallery-grid" && <ModernRomancePreview />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;

import { useEffect, useRef, useState } from "react";
import aureaIcon from "@/assets/aureaLogoIcon.png";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  Users,
} from "lucide-react";
import veriteTemplate from "@/assets/verite-preview-10.jpg";
import graceTemplate from "@/assets/preview-wedding-10.jpg";
import eclatTemplate from "@/assets/aura-preview-10.jpg";
import auraTemplate from "@/assets/doree1.jpeg";
import lumiereTemplate from "@/assets/lumiere-4.jpg";
import etoileTemplate from "@/assets/etoile-6.jpg";
import { VeritePreview } from "@/components/templates/VeritePreview";
import { GracePreview } from "@/components/templates/GracePreview";
import { EclatPreview } from "@/components/templates/EclatPreview";
import { AuraPreview } from "@/components/templates/AuraPreview";
import LumierePreview from "@/components/templates/LumierePreview";
import EtoilePreview from "@/components/templates/EtoilePreview";
import SoireePreview from "@/components/templates/SoireePreview";

const Dashboard = () => {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const loggingOut = useRef(false);

  const checkUser = async () => {
    if (loggingOut.current) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session && !loggingOut.current) {
      navigate("/auth");
    }
  };

  const handleLogout = async () => {
    loggingOut.current = true;
    await supabase.auth.signOut();
    navigate("/");
  };

  const weddingTemplates = [
    {
      id: "lumiere-editorial",
      name: "Lumière",
      description: "Cinematic video & torn-edge luxury editorial design",
      image: lumiereTemplate,
      features: [
        { icon: Video, text: "Video Background" },
        { icon: Images, text: "Photo Gallery" },
        { icon: GiftIcon, text: "Gift Registry" },
        { icon: Clock, text: "Countdown Timer" },
        { icon: Calendar, text: "RSVP" },
      ],
    },
    {
      id: "template6",
      name: "Grâce",
      description: "Immersive full-screen video background experience",
      image: graceTemplate,
      features: [
        { icon: Video, text: "Video Background" },
        { icon: MapPin, text: "Event Locations" },
        { icon: GiftIcon, text: "Gift Registry" },
        { icon: Clock, text: "Countdown Timer" },
        { icon: Calendar, text: "RSVP" },
      ],
    },
    {
      id: "template2",
      name: "Vérité",
      description: "Contemporary design with stunning gallery showcase",
      image: veriteTemplate,
      features: [
        { icon: Images, text: "Photo Gallery" },
        { icon: MapPin, text: "Event Locations" },
        { icon: GiftIcon, text: "Gift Registry" },
        { icon: Clock, text: "Countdown Timer" },
        { icon: Calendar, text: "RSVP" },
      ],
    },
    {
      id: "classic-romance",
      name: "Éclat",
      description: "Elegant scrollable design with photo gallery and RSVP",
      image: eclatTemplate,
      features: [
        { icon: Images, text: "Photo Gallery" },
        { icon: MapPin, text: "Event Locations" },
        { icon: GiftIcon, text: "Gift Registry" },
        { icon: Clock, text: "Countdown Timer" },
        { icon: Calendar, text: "RSVP" },
      ],
    },
    {
      id: "bible-verse-tabs",
      name: "Dorée",
      description: "Elegant tab design with Bible verse, family names & botanical decor",
      image: auraTemplate,
      features: [
        { icon: Sparkles, text: "Bible Verse" },
        { icon: Heart, text: "Family Names" },
        { icon: MapPin, text: "Event Locations" },
        { icon: Clock, text: "Countdown Timer" },
        { icon: Calendar, text: "RSVP" },
      ],
    },
    {
      id: "etoile-carousel",
      name: "Étoile",
      description: "Fullscreen photo carousel with animated cards & cinematic reveals",
      image: etoileTemplate,
      features: [
        { icon: Images, text: "Photo Carousel" },
        { icon: Images, text: "Photo Gallery" },
        { icon: GiftIcon, text: "Gift Registry" },
        { icon: Clock, text: "Countdown Timer" },
        { icon: Calendar, text: "RSVP" },
      ],
    },
    {
      id: "soiree-swipe",
      name: "Soirée",
      description: "Horizontal swipe storytelling with cinematic transitions",
      image: lumiereTemplate,
      features: [
        { icon: Video, text: "Video Background" },
        { icon: Images, text: "Photo Gallery" },
        { icon: GiftIcon, text: "Gift Registry" },
        { icon: Clock, text: "Countdown Timer" },
        { icon: Calendar, text: "RSVP" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="bg-white/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={aureaIcon}
                alt="Auréa Invites"
                loading="lazy"
                className="h-12 sm:h-12 object-contain cursor-pointer"
                onClick={() => navigate("/")}
              />
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-foreground">
                  Choose Your Template
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Create beautiful invitations</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                onClick={() => navigate("/dashboard/my-events")}
                className="flex-1 sm:flex-none rounded-full px-5 shadow-sm hover:shadow-md transition-all"
              >
                My Events
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex-1 sm:flex-none rounded-full border-border/60 hover:bg-muted/50"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Logout</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard/settings")}
                title="Settings"
                className="rounded-full hover:bg-muted/50"
              >
                <UserCog className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="space-y-10 sm:space-y-16">
          {/* Weddings Section */}
          <div>
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-100 to-rose-50 shadow-sm">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground">Weddings</h2>
                <p className="text-xs text-muted-foreground">Elegant templates for your special day</p>
              </div>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {weddingTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="group border-0 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 flex flex-col rounded-2xl overflow-hidden"
                >
                  <CardHeader className="p-0 flex-grow">
                    <div className="aspect-video overflow-hidden relative">
                      <img
                        src={template.image}
                        alt={template.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Overlay gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <CardTitle className="text-lg font-serif">{template.name}</CardTitle>
                        <span className="flex-shrink-0 text-lg font-bold font-serif text-primary">{"$100"}</span>
                      </div>
                      <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                        {template.description}
                      </CardDescription>

                      {template.features && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {template.features.map((feature, idx) => {
                            const FeatureIcon = feature.icon;
                            return (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-[10px] flex items-center gap-1 py-0.5 px-2 bg-muted/60 hover:bg-muted transition-colors"
                              >
                                <FeatureIcon className="w-2.5 h-2.5" />
                                {feature.text}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 pt-0 mt-auto space-y-2.5">
                    <Button
                      variant="outline"
                      className="w-full text-sm rounded-full border-border/60 hover:bg-muted/50 hover:border-primary/30 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPreview(template.id);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      className="w-full text-sm rounded-full shadow-sm hover:shadow-md transition-all"
                      onClick={() => {
                        const routeMap: Record<string, string> = {
                          "bible-verse-tabs": "/dashboard/aura-form",
                          template2: "/dashboard/verite-form",
                          "classic-romance": "/dashboard/eclat-form",
                          template6: "/dashboard/grace-form",
                          "lumiere-editorial": "/dashboard/lumiere-form",
                          "etoile-carousel": "/dashboard/etoile-form",
                          "soiree-swipe": "/dashboard/lumiere-form",
                        };
                        const route = routeMap[template.id] || "/dashboard/create";
                        navigate(`${route}?eventType=weddings&template=${template.id}`);
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
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50 shadow-sm">
                <GlassWater className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground">Bachelor</h2>
                  <p className="text-xs text-muted-foreground">Party invitations</p>
                </div>
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-indigo-100 text-indigo-700 border-0">
                  Coming Soon
                </Badge>
              </div>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-0 bg-white/50 backdrop-blur-sm shadow-md opacity-60 flex flex-col rounded-2xl overflow-hidden">
                <CardHeader className="p-0 flex-grow">
                  <div className="aspect-video overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center">
                      <GlassWater className="w-12 h-12 sm:w-14 sm:h-14 text-indigo-400" />
                    </div>
                  </div>
                  <div className="p-5">
                    <CardTitle className="text-lg font-serif mb-1.5">Bachelor Template</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      Celebrate your bachelor party in style
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Preview Modal */}
      <Dialog open={showPreview !== null} onOpenChange={(open) => !open && setShowPreview(null)}>
        <DialogContent className="max-w-[100vw] w-full h-[100dvh] max-h-[100dvh] p-0 overflow-hidden rounded-none border-none top-0 left-0 translate-x-0 translate-y-0 sm:rounded-lg sm:max-w-[95vw] sm:max-h-[95vh] sm:h-[95vh] sm:top-[50%] sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%]">
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
            {showPreview === "template2" && <VeritePreview />}
            {showPreview === "template6" && <GracePreview />}
            {showPreview === "classic-romance" && <EclatPreview />}
            {showPreview === "bible-verse-tabs" && <AuraPreview />}
            {showPreview === "lumiere-editorial" && <LumierePreview />}
            {showPreview === "etoile-carousel" && <EtoilePreview />}
            {showPreview === "soiree-swipe" && <SoireePreview />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;

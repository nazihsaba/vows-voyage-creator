import { useEffect, useState } from "react";
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
} from "lucide-react";
import veriteTemplate from "@/assets/template-verite.jpg";
import cinematicVideo from "@/assets/template-cinematic-video.jpg";
import lumiereTemplate from "@/assets/template-lumiere.jpg";
import classicRomance from "@/assets/template-wedding-classic.jpg";
import bibleVerseTabs from "@/assets/template-bible-verse.jpg";
import ivoireTemplate from "@/assets/template-ivoire.jpg";
import { ModernRomancePreview } from "@/components/templates/ModernRomancePreview";
import { VideoBackgroundPreview } from "@/components/templates/VideoBackgroundPreview";
import { RoseGoldTabsPreview } from "@/components/templates/RoseGoldTabsPreview";
import { ClassicRomancePreview } from "@/components/templates/ClassicRomancePreview";
import { BibleVerseTabsPreview } from "@/components/templates/BibleVerseTabsPreview";
import { EnvelopeTemplatePreview } from "@/components/templates/EnvelopeTemplatePreview";

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
      id: "bible-verse-tabs",
      name: "Aura",
      description: "Elegant tab design with Bible verse, family names & botanical decor",
      image: bibleVerseTabs,
      features: [
        { icon: Sparkles, text: "Bible Verse" },
        { icon: Heart, text: "Family Names" },
        { icon: MapPin, text: "Event Locations" },
        { icon: Clock, text: "Countdown Timer" },
      ],
    },
    {
      id: "envelope-invitation",
      name: "Épure",
      description: "Elegant envelope opening animation with wax seal and tab navigation",
      image: ivoireTemplate,
      features: [
        { icon: Sparkles, text: "Envelope Animation" },
        { icon: Heart, text: "Wax Seal" },
        { icon: MapPin, text: "Event Locations" },
        { icon: Clock, text: "Countdown Timer" },
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
      ],
    },
    {
      id: "classic-romance",
      name: "Éclat",
      description: "Elegant scrollable design with photo gallery and RSVP",
      image: classicRomance,
      features: [
        { icon: Images, text: "Photo Gallery" },
        { icon: MapPin, text: "Event Locations" },
        { icon: GiftIcon, text: "Gift Registry" },
        { icon: Clock, text: "Countdown Timer" },
      ],
    },
    {
      id: "rose-gold-tabs",
      name: "Lumière",
      description: "Fullscreen video background with elegant page transitions",
      image: lumiereTemplate,
      features: [
        { icon: Video, text: "Video Background" },
        { icon: Sparkles, text: "Page Transitions" },
        { icon: MapPin, text: "Event Locations" },
        { icon: Clock, text: "Countdown Timer" },
      ],
    },
    {
      id: "template6",
      name: "Grâce",
      description: "Immersive full-screen video background experience",
      image: cinematicVideo,
      features: [
        { icon: Video, text: "Video Background" },
        { icon: MapPin, text: "Event Locations" },
        { icon: GiftIcon, text: "Gift Registry" },
        { icon: Clock, text: "Countdown Timer" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="bg-white/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
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
                <span className="sm:hidden">Exit</span>
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

            <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {weddingTemplates.map((template) => (
                <Card key={template.id} className="group border-0 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 flex flex-col rounded-2xl overflow-hidden">
                  <CardHeader className="p-0 flex-grow">
                    <div className="aspect-video overflow-hidden relative">
                      {template.id === "envelope-invitation" ? (
                        <div className="w-full h-full relative group/envelope cursor-pointer" style={{ perspective: '1000px' }}>
                          {/* Card/Letter that slides up */}
                          <div className="absolute inset-x-2 top-4 bottom-2 z-10 transition-all duration-700 ease-out group-hover/envelope:-translate-y-8 group-hover/envelope:scale-[0.85]">
                            <div className="w-full h-full rounded-sm bg-white shadow-xl overflow-hidden border border-primary/20">
                              <img 
                                src={template.image} 
                                alt={template.name} 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                          </div>
                          
                          {/* Envelope back */}
                          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/20 to-primary/40 shadow-inner" />
                          
                          {/* Envelope side flaps (left & right) */}
                          <div className="absolute left-0 top-0 w-1/4 h-full bg-gradient-to-r from-primary/30 to-transparent z-20 opacity-60" />
                          <div className="absolute right-0 top-0 w-1/4 h-full bg-gradient-to-l from-primary/30 to-transparent z-20 opacity-60" />
                          
                          {/* Envelope top flap with 3D rotation */}
                          <div 
                            className="absolute top-0 left-0 w-full h-[55%] origin-top z-30 transition-transform duration-700 ease-out group-hover/envelope:[transform:rotateX(-180deg)]"
                            style={{ transformStyle: 'preserve-3d' }}
                          >
                            {/* Front of flap (visible initially) */}
                            <div 
                              className="absolute inset-0 bg-gradient-to-b from-background via-primary/10 to-primary/20"
                              style={{ backfaceVisibility: 'hidden' }}
                            >
                              {/* Triangular fold pattern */}
                              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 55" preserveAspectRatio="none">
                                <polygon 
                                  points="0,0 100,0 50,55" 
                                  className="fill-primary/30"
                                />
                              </svg>
                              {/* Wax seal */}
                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-secondary/80 shadow-lg flex items-center justify-center border-2 border-secondary/60">
                                <Heart className="w-5 h-5 text-white fill-white drop-shadow" />
                              </div>
                            </div>
                            {/* Back of flap (visible when opened) */}
                            <div 
                              className="absolute inset-0 bg-gradient-to-t from-primary/40 to-primary/20"
                              style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}
                            />
                          </div>
                          
                          {/* Bottom fold shadow line */}
                          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-t from-primary/50 to-transparent z-20" />
                        </div>
                      ) : (
                        <img 
                          src={template.image} 
                          alt={template.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                      )}
                      {/* Overlay gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-5">
                      <CardTitle className="text-lg font-serif mb-1.5">{template.name}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground leading-relaxed">{template.description}</CardDescription>

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
                        if (template.id === "rose-gold-tabs" || template.id === "bible-verse-tabs") {
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

            <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
            {showPreview === "classic-romance" && <ClassicRomancePreview />}
            {showPreview === "bible-verse-tabs" && <BibleVerseTabsPreview />}
            {showPreview === "envelope-invitation" && <EnvelopeTemplatePreview />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;

import { useEffect, useRef, useState } from "react";
import aureaIcon from "@/assets/aureaLogoIcon.png";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Sparkles,
  UserCog,
  Eye,
  X,
  Users,
  Music,
  Smartphone,
  Mail,
  CalendarDays,
} from "lucide-react";
import veriteTemplate from "@/assets/verite-preview-10.jpg";
import graceTemplate from "@/assets/preview-wedding-10.jpg";
import eclatTemplate from "@/assets/aura-preview-10.jpg";
import auraTemplate from "@/assets/doree1.jpeg";
import lumiereTemplate from "@/assets/lumiere-4.jpg";
import tresorCover from "@/assets/tresor-cover.jpeg";
import etoileTemplate from "@/assets/etoile-6.jpg";
import dentelleCover from "@/assets/dentelle-cover.jpg";

import { VeritePreview } from "@/components/templates/VeritePreview";
import { GracePreview } from "@/components/templates/GracePreview";
import { EclatPreview } from "@/components/templates/EclatPreview";
import { AuraPreview } from "@/components/templates/AuraPreview";
import LumierePreview from "@/components/templates/LumierePreview";
import EtoilePreview from "@/components/templates/EtoilePreview";
import TresorPreview from "@/components/templates/TresorPreview";
import DentellePreview from "@/components/templates/DentellePreview";
import BookingCalendar from "@/components/BookingCalendar";
import { PHYSICAL_CARDS_CALENDLY_URL } from "@/config/booking";


const Dashboard = () => {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: "digital" | "physical" =
    searchParams.get("tab") === "physical" ? "physical" : "digital";

  const switchTab = (tab: "digital" | "physical") => {
    if (tab === activeTab) return;
    const next = new URLSearchParams(searchParams);
    if (tab === "digital") next.delete("tab");
    else next.set("tab", tab);
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cardTabs = [
    { id: "digital" as const, label: "Digital Cards", icon: Smartphone },
    { id: "physical" as const, label: "Physical Cards", icon: Mail },
  ];

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
      return;
    }
    setUserEmail(session?.user?.email ?? undefined);
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
      price: 100,
      description: "Cinematic video & torn-edge luxury editorial design",
      image: lumiereTemplate,
      features: [
        { icon: Video, text: "Video Background" },
        { icon: Images, text: "Photo Gallery" },
        { icon: GiftIcon, text: "Gift Registry" },
        { icon: Clock, text: "Countdown Timer" },
        { icon: Calendar, text: "RSVP" },
        { icon: Music, text: "Background Music" },
      ],
    },
    {
      id: "template6",
      name: "Grâce",
      price: 100,
      description: "Immersive full-screen video background experience",
      image: graceTemplate,
      features: [
        { icon: Video, text: "Video Background" },
        { icon: MapPin, text: "Event Locations" },
        { icon: GiftIcon, text: "Gift Registry" },
        { icon: Clock, text: "Countdown Timer" },
        { icon: Calendar, text: "RSVP" },
        { icon: Music, text: "Background Music" },
      ],
    },
    {
      id: "template2",
      name: "Vérité",
      price: 100,
      description: "Contemporary design with stunning gallery showcase",
      image: veriteTemplate,
      features: [
        { icon: Images, text: "Photo Gallery" },
        { icon: MapPin, text: "Event Locations" },
        { icon: GiftIcon, text: "Gift Registry" },
        { icon: Clock, text: "Countdown Timer" },
        { icon: Calendar, text: "RSVP" },
        { icon: Music, text: "Background Music" },
      ],
    },
    {
      id: "classic-romance",
      name: "Éclat",
      price: 100,
      description: "Elegant scrollable design with photo gallery and RSVP",
      image: eclatTemplate,
      features: [
        { icon: Images, text: "Photo Gallery" },
        { icon: MapPin, text: "Event Locations" },
        { icon: GiftIcon, text: "Gift Registry" },
        { icon: Clock, text: "Countdown Timer" },
        { icon: Calendar, text: "RSVP" },
        { icon: Music, text: "Background Music" },
      ],
    },
    {
      id: "bible-verse-tabs",
      name: "Dorée",
      price: 100,
      description: "Elegant tab design, family names & botanical decor",
      image: auraTemplate,
      features: [
        { icon: Sparkles, text: "Bible Verse" },
        { icon: Heart, text: "Family Names" },
        { icon: MapPin, text: "Event Locations" },
        { icon: Clock, text: "Countdown Timer" },
        { icon: Calendar, text: "RSVP" },
        { icon: Music, text: "Background Music" },
      ],
    },
    {
      id: "etoile-carousel",
      name: "Étoile",
      price: 100,
      description: "Fullscreen photo carousel with animated cards & cinematic reveals",
      image: etoileTemplate,
      features: [
        { icon: Images, text: "Photo Carousel" },
        { icon: Images, text: "Photo Gallery" },
        { icon: GiftIcon, text: "Gift Registry" },
        { icon: Clock, text: "Countdown Timer" },
        { icon: Calendar, text: "RSVP" },
        { icon: Music, text: "Background Music" },
      ],
    },
    {
      id: "tresor-swipe",
      name: "Trésor",
      price: 120,
      description: "Horizontal swipe storytelling with cinematic transitions",
      image: tresorCover,
      features: [
        { icon: Video, text: "Video Background" },
        { icon: Images, text: "Photo Gallery" },
        { icon: GiftIcon, text: "Gift Registry" },
        { icon: Clock, text: "Countdown Timer" },
        { icon: Calendar, text: "RSVP" },
        { icon: Music, text: "Background Music" },
      ],
    },
    {
      id: "dentelle-lace",
      name: "Dentelle",
      price: 100,
      description: "Romantic lace with a wax-sealed envelope opening and mocha accents",
      image: dentelleCover,
      features: [
        { icon: Sparkles, text: "Wax Seal Opening" },
        { icon: MapPin, text: "Event Locations" },
        { icon: Clock, text: "Day Timeline & Countdown" },
        { icon: GiftIcon, text: "Gift Registry" },
        { icon: Calendar, text: "RSVP" },
        { icon: Music, text: "Background Music" },
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
                  <span
                    key={activeTab}
                    className="inline-block animate-in fade-in slide-in-from-bottom-1 duration-300"
                  >
                    {activeTab === "digital" ? "Choose Your Template" : "Physical Cards"}
                  </span>
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  <span
                    key={`sub-${activeTab}`}
                    className="inline-block animate-in fade-in duration-300"
                  >
                    {activeTab === "digital" ? "Create beautiful invitations" : "Printed invitations for your guests"}
                  </span>
                </p>
              </div>
            </div>
            <div
              role="tablist"
              aria-label="Card type"
              className="relative grid w-full sm:w-[22rem] grid-cols-2 items-center p-1 rounded-full bg-muted/60 border border-border/50 shadow-inner"
            >
              <span
                aria-hidden
                className={`absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-button border border-bronze shadow-sm transition-transform duration-300 ease-out will-change-transform ${
                  activeTab === "physical" ? "translate-x-full" : "translate-x-0"
                }`}
              />
              {cardTabs.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => switchTab(tab.id)}
                    className={`relative z-10 flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-3 sm:px-4 py-2 text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <TabIcon
                      aria-hidden
                      className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                        isActive ? "scale-105" : "scale-100"
                      }`}
                    />
                    {tab.label}
                  </button>
                );
              })}
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
        <div
          key={activeTab}
          className="animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out"
        >
        {activeTab === "physical" ? (
          <div className="space-y-10 sm:space-y-14">
            {/* Intro: what physical cards are, and what the call covers */}
            <section className="grid items-center gap-10 lg:gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
              <div className="order-2 lg:order-1 max-w-xl">
                <h2 className="font-serif text-[2.1rem] leading-[1.1] sm:text-5xl sm:leading-[1.08] font-bold text-foreground">
                  Printed cards, designed with you
                </h2>
                <p className="mt-5 text-base sm:text-[17px] leading-relaxed text-muted-foreground">
                  Book a short call with us. We'll go through paper, printing finishes, quantities and delivery dates,
                  and shape a card that matches your wedding.
                </p>

                <dl className="mt-8 grid grid-cols-2 gap-x-6 sm:gap-x-10 border-t border-[#d9c3a0]/60">
                  {[
                    { term: "When", detail: "Mon to Fri, 6 to 8 PM" },
                    { term: "How", detail: "Google Meet or WhatsApp call" },
                    { term: "Length", detail: "30 minutes" },
                    { term: "Notice", detail: "Book 3 days ahead" },
                  ].map(({ term, detail }) => (
                    <div key={term} className="border-b border-[#d9c3a0]/60 py-3.5">
                      <dt className="font-serif italic text-sm text-[#8a6a3b]">{term}</dt>
                      <dd className="mt-0.5 text-sm sm:text-[15px] text-foreground">{detail}</dd>
                    </div>
                  ))}
                </dl>

                <a
                  href="#book"
                  className="mt-8 inline-flex items-center rounded-full bg-foreground px-7 py-3 text-sm font-medium text-background hover:bg-foreground/85 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Choose a time
                </a>
              </div>

              {/* The memorable element: a small stack of printed cards */}
              <div aria-hidden className="order-1 lg:order-2 relative mx-auto w-[250px] h-[300px] sm:w-[320px] sm:h-[380px]">
                {/* Envelope */}
                <div className="absolute inset-x-2 bottom-0 h-[62%] rotate-[7deg] rounded-[6px] bg-[#e8d2b8] shadow-[0_18px_40px_-18px_rgba(90,60,20,0.45)]">
                  <div
                    className="absolute inset-x-0 top-0 h-1/2 bg-[#dcc2a3]"
                    style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                  />
                </div>
                {/* Blush card behind */}
                <div className="absolute left-0 top-4 w-[86%] h-[84%] -rotate-[8deg] rounded-[4px] bg-[#f1d9d6] shadow-[0_10px_30px_-16px_rgba(90,60,20,0.4)]" />
                {/* Front invitation */}
                <div className="absolute right-1 top-0 w-[86%] h-[88%] -rotate-[2deg] rounded-[4px] bg-[#fffdf8] shadow-[0_24px_50px_-20px_rgba(90,60,20,0.5)] motion-safe:animate-[card-settle_900ms_cubic-bezier(0.2,0.8,0.2,1)_both]">
                  <div className="absolute inset-3 sm:inset-4 border border-[#c6a46b]">
                    <div className="absolute inset-1 border border-[#c6a46b]/50" />
                  </div>
                  <div className="relative h-full flex flex-col items-center justify-center text-center px-8">
                    <p className="font-serif italic text-[11px] sm:text-[13px] text-[#8a6a3b] leading-snug">
                      Together with their families
                    </p>
                    <p className="font-script text-[34px] sm:text-[44px] leading-none text-foreground mt-3">Maya</p>
                    <p className="font-serif italic text-sm text-[#8a6a3b] my-1">&amp;</p>
                    <p className="font-script text-[34px] sm:text-[44px] leading-none text-foreground">Karim</p>
                    <span className="block w-10 h-px bg-[#c6a46b] my-4" />
                    <p className="font-serif text-[10px] sm:text-xs tracking-wide text-foreground/70">
                      Saturday, the twelfth of June
                    </p>
                  </div>
                  {/* Wax seal */}
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[radial-gradient(circle_at_35%_30%,#c98a86,#9e5d5a_70%)] shadow-[0_6px_14px_-4px_rgba(80,30,30,0.55)] flex items-center justify-center">
                    <span className="font-script text-xl sm:text-2xl text-[#f6e3de]/90">A</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Booking */}
            <section
              id="book"
              className="scroll-mt-28 rounded-[28px] bg-white border border-[#e7d8c2] shadow-[0_30px_60px_-40px_rgba(90,60,20,0.35)] overflow-hidden"
            >
              <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-2 flex flex-wrap items-end justify-between gap-2 border-b border-[#efe4d3]">
                <div className="pb-4">
                  <h3 className="font-serif text-2xl sm:text-[28px] font-bold text-foreground">Pick a time</h3>
                  <p className="text-sm text-muted-foreground mt-1">Highlighted days have free times. All times are Beirut time.</p>
                </div>
              </div>
              <div className="px-1 sm:px-2 pb-2">
                <BookingCalendar prefillEmail={userEmail} calendlyUrl={PHYSICAL_CARDS_CALENDLY_URL} />
              </div>
            </section>
          </div>
        ) : (
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
                        <span className="flex-shrink-0 text-lg font-bold font-serif text-primary">{`$${template.price}`}</span>
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
                          "tresor-swipe": "/dashboard/tresor-form",
                          "dentelle-lace": "/dashboard/dentelle-form",
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
        </div>
        )}
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
            {showPreview === "tresor-swipe" && <TresorPreview />}
            {showPreview === "dentelle-lace" && <DentellePreview />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;

import { Button } from "@/components/ui/button";
import {
  Calendar,
  Image,
  Gift,
  Link as LinkIcon,
  Instagram,
  MessageCircle,
  Users,
  Languages,
  Mail,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import aureaLogo from "@/assets/aureaLogoFullColored.png";
import InvitationPreviewSection from "@/components/InvitationPreviewSection";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import eventWedding from "@/assets/event-wedding.jpg";
import eventBirthday from "@/assets/event-birthday.jpg";
import eventParty from "@/assets/event-party.jpg";
import eventCelebration from "@/assets/event-celebration.jpg";
import previewWedding5 from "@/assets/preview-wedding-10.jpg";

import flowerVase from "@/assets/annie-spratt-z7V1ibFxju0-unsplash.jpg";
import sparklers from "@/assets/ian-schneider-PAykYb-8Er8-unsplash.jpg";
import carouselRings from "@/assets/carousel-rings.jpg";
import tableDecor from "@/assets/taylor-gray-_9Lh9_uO34o-unsplash.jpg";
import whatsappIcon from "@/assets/whatsappIcon.png";
import { Icon } from "@iconify/react";

const Index = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const heroImages = [
    { src: tableDecor, alt: "Wedding celebration" },
    { src: sparklers, alt: "Celebration sparklers" },
    { src: flowerVase, alt: "Party celebration" },
    { src: carouselRings, alt: "Wedding rings with flowers" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="bg-white/80 backdrop-blur-sm shadow-soft sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={aureaLogo} alt="Auréa" loading="lazy" className="h-14" />
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button onClick={() => navigate("/dashboard/my-events")}>My Events</Button>
            ) : (
              <Button onClick={() => navigate("/auth")}>Sign In</Button>
            )}
          </div>
        </div>
      </header>

      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <img src={image.src} alt={image.alt} loading="lazy" className="w-full h-full object-cover" />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30" />
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-3">
            The Modern Way to Invite Your Wedding Guests
          </h1>
          <p className="text-base md:text-lg font-light tracking-wide opacity-80 mb-6 italic">
            Design your wedding invitation, manage guests, RSVP responses, tables, and share personalized links — all in
            one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              Create My Invitation
            </Button>
            {/* <Button
              size="lg"
              onClick={() => setShowComingSoon(true)}
              className="text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              View Demo
            </Button> */}

            <Dialog open={showComingSoon} onOpenChange={setShowComingSoon}>
              <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none rounded-3xl shadow-2xl">
                {/* Decorative top gradient bar */}
                <div className="h-2 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

                <div className="flex flex-col items-center gap-5 px-8 pt-8 pb-10 text-center">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-serif font-bold text-primary tracking-tight">Coming Soon!</h3>
                    <p className="text-xs uppercase tracking-[0.25em] text-primary/50 font-medium">
                      Something special is brewing
                    </p>
                  </div>

                  <div className="w-12 h-px bg-primary/20" />

                  <p className="text-muted-foreground leading-relaxed text-[15px] max-w-xs">
                    We're putting the finishing touches on our demo experience. Stay tuned — something beautiful is on
                    its way!
                  </p>

                  <Button
                    onClick={() => setShowComingSoon(false)}
                    className="mt-1 px-8 py-5 rounded-full bg-primary text-primary-foreground hover:bg-primary-hover text-base font-medium shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Can't Wait!
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-sm md:text-base font-light tracking-wide opacity-75">
            No coding needed &nbsp;•&nbsp; Mobile-friendly &nbsp;•&nbsp; Share your invitation instantly
          </p>
        </div>
      </section>

      <InvitationPreviewSection />

      <section className="py-24 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.3em] text-primary/70 font-medium mb-3">Features</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Everything You Need</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Powerful tools to make your invitation truly unforgettable.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Calendar,
                title: "Live Countdown",
                desc: "A live countdown to your special day, building excitement for your guests",
              },
              {
                icon: Image,
                title: "Photos & Video",
                desc: "Showcase your moments with photos and immersive video backgrounds for a stunning experience",
              },
              {
                icon: Gift,
                title: "Gifts Registry",
                desc: "Share your gift registry or preferred gift cards in a simple and elegant way",
              },
              {
                icon: Users,
                title: "RSVP & Seating",
                desc: "Track responses, organize guests, and manage tables with ease",
              },
              {
                icon: LinkIcon,
                title: "Personal Invitation Links",
                desc: "Create unique links for each guest or group and share instantly",
              },
              {
                icon: Languages,
                title: "Multi-Language",
                desc: "Seamlessly switch between English and Arabic to welcome every guest in their preferred language",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group text-center p-8 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 hover:shadow-elegant hover:-translate-y-1 transition-all duration-500"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors duration-300">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.3em] text-primary/70 font-medium mb-3">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
              Choose the experience that fits you best
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Create your invitation yourself, or let Auréa handle everything for you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* Option 1: DIY */}
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 md:p-10 flex flex-col">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-serif font-bold text-primary mb-2">Do It Yourself</h3>
                <p className="text-muted-foreground text-sm">Perfect for a quick, hands-on experience</p>
              </div>
              <div className="space-y-0 mb-8">
                {[
                  { step: "1", text: "Create your account" },
                  { step: "2", text: "Choose your template" },
                  { step: "3", text: "Customize your invitation" },
                  { step: "4", text: "Pay and share instantly" },
                ].map((item, i) => (
                  <div key={item.step}>
                    <div className="flex items-center gap-5 py-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-primary">{item.step}</span>
                      </div>
                      <p className="text-foreground text-base">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-8 mt-auto">
                <div className="space-y-3">
                  {["Instant access", "Full control", "Faster setup", "Easy to use"].map((perk) => (
                    <div key={perk} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">{perk}</span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="bg-primary text-primary-foreground hover:bg-primary-hover px-8 sm:px-10 py-5 rounded-lg text-base w-full sm:w-auto"
                >
                  Start Creating
                </Button>
              </div>
            </div>

            {/* Option 2: Managed */}
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 md:p-10 flex flex-col">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-serif font-bold text-primary mb-2">Let Us Handle It</h3>
                <p className="text-muted-foreground text-sm">
                  Perfect for a more personalized, done-for-you experience
                </p>
              </div>
              <div className="space-y-0 mb-8">
                {[
                  { step: "1", text: "Contact us" },
                  { step: "2", text: "Share your event details" },
                  { step: "3", text: "We prepare everything for you" },
                  { step: "4", text: "Pay and share with your guests" },
                ].map((item, i) => (
                  <div key={item.step}>
                    <div className="flex items-center gap-5 py-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-primary">{item.step}</span>
                      </div>
                      <p className="text-foreground text-base">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-8 mt-auto">
                <div className="space-y-3">
                  {["Personalized support", "We handle the setup", "Less effort for you"].map((perk) => (
                    <div key={perk} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">{perk}</span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => window.open("https://wa.me/96179077970", "_blank")}
                  className="bg-primary text-primary-foreground hover:bg-primary-hover px-8 sm:px-10 py-5 rounded-lg text-base w-full sm:w-auto"
                >
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-6">
            Ready to Create Your Invitation?
          </h2>
          <p className="text-xl text-muted-foreground mb-4">Create your wedding invitation with timeless elegance</p>
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="text-lg px-8 py-6 bg-primary hover:bg-primary-hover"
            >
              Create Your Invitation
            </Button>
          </div>
        </div>
      </section> */}

      <footer className="py-10 px-4 border-t border-border/40 bg-muted/30">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground font-medium tracking-wide">Follow us</p>
          <div className="flex items-center gap-6">
            <a
              href="https://www.instagram.com/aureainvites?igsh=MXJjYmJrejF3ejI3eQ=="
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={22} />
            </a>
            {/* <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="TikTok"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </a> */}
            <a
              href="https://wa.me/96179077970"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="WhatsApp"
            >
              <Icon icon="basil:whatsapp-outline" className="w-6 h-6" />
            </a>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-2">
            © {new Date().getFullYear()} Aurea Invites. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

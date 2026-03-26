import { Button } from "@/components/ui/button";
import { Calendar, Image, Gift, Link as LinkIcon, Instagram, MessageCircle } from "lucide-react";
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
import eclatWedding2 from "@/assets/eclat-wedding-2.jpg";
import flowerVase from "@/assets/annie-spratt-z7V1ibFxju0-unsplash.jpg";
import sparklers from "@/assets/ian-schneider-PAykYb-8Er8-unsplash.jpg";
import tableDecor from "@/assets/taylor-gray-_9Lh9_uO34o-unsplash.jpg";

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
    { src: eclatWedding2, alt: "Birthday party" },
    { src: flowerVase, alt: "Party celebration" },
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
            <img src={aureaLogo} alt="Auréa" className="h-14" />
          </div>
          {!isAuthenticated && (
            <div className="flex items-center gap-3">
              <Button onClick={() => navigate("/auth")}>Sign In</Button>
            </div>
          )}
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
              <img src={image.src} alt={image.alt} className="w-full h-full object-cover" />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30" />
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-3">Create Beautiful Event Invitations</h1>
          <p className="text-base md:text-lg font-light tracking-wide opacity-80 mb-6 italic">
            Elegant digital invitations for unforgettable moments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              Create Event
            </Button>
            <Button
              size="lg"
              onClick={() => setShowComingSoon(true)}
              className="text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              View Demo
            </Button>

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
          <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-6">
            {[
              { icon: Calendar, title: "Countdown Timer", desc: "Real-time countdown to your special day" },
              { icon: Image, title: "Photo Gallery", desc: "Showcase your memorable moments" },
              { icon: Gift, title: "Gift Registry", desc: "Share gift card and registry information" },
              { icon: Calendar, title: "RSVP", desc: "Manage guest attendance and responses" },
              { icon: LinkIcon, title: "Custom Links", desc: "Auto-generated unique invitation URLs" },
              {
                icon: Users,
                title: "Guest Tracking",
                desc: "Track attendance status for each invited guest in real time",
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
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Two Ways to Get Started</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Whether you prefer a hands-on approach or a fully managed experience, we've got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Option 1: DIY */}
            <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-8 hover:shadow-elegant transition-all duration-500">
              <h3 className="text-2xl font-serif font-bold text-primary mb-6 text-center">Do It Yourself</h3>
              <div className="space-y-5">
                {[
                  { step: "1", text: "Visit aureainvites.com" },
                  { step: "2", text: "Create your personal account" },
                  { step: "3", text: "Choose your template" },
                  { step: "4", text: "Customize your invitation details" },
                  { step: "5", text: "Pay once, share unlimited links" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-primary">{item.step}</span>
                    </div>
                    <p className="text-foreground">{item.text}</p>
                  </div>
                ))}
              </div>
              {/* <div className="mt-8 text-center">
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="bg-primary text-primary-foreground hover:bg-primary-hover px-8"
                >
                  Get Started
                </Button>
              </div> */}
            </div>

            {/* Option 2: Managed */}
            <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-8 hover:shadow-elegant transition-all duration-500">
              <h3 className="text-2xl font-serif font-bold text-primary mb-6 text-center">Let Us Handle It</h3>
              <div className="space-y-5">
                {[
                  { step: "1", text: "Contact us" },
                  { step: "2", text: "Share your event details" },
                  { step: "3", text: "We take care of everything" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-secondary/30 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-primary">{item.step}</span>
                    </div>
                    <p className="text-foreground">{item.text}</p>
                  </div>
                ))}
              </div>
              {/* <div className="mt-8 text-center">
                <Button onClick={() => window.open("https://wa.me/", "_blank")} variant="outline" className="border-primary text-primary hover:bg-primary/5 px-8">
                  Contact Us
                </Button>
              </div> */}
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
            <a
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
            </a>
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="WhatsApp"
            >
              <MessageCircle size={22} />
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

import { Button } from "@/components/ui/button";
import { PartyPopper, Calendar, Image, Gift, Link as LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import eventWedding from "@/assets/event-wedding.jpg";
import eventBirthday from "@/assets/event-birthday.jpg";
import eventParty from "@/assets/event-party.jpg";
import eventCelebration from "@/assets/event-celebration.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const heroImages = [
    { src: eventWedding, alt: "Wedding celebration" },
    { src: eventBirthday, alt: "Birthday party" },
    { src: eventParty, alt: "Party celebration" },
    { src: eventCelebration, alt: "Special celebration" },
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
            <PartyPopper className="w-8 h-8 text-primary" />
            <span className="text-2xl font-serif font-bold text-primary">Perfect Events</span>
          </div>
          <Button onClick={() => navigate("/auth")} variant="outline">
            Sign In
          </Button>
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
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">
            Create Beautiful Event Invitations
          </h1>
          <p className="text-xl md:text-2xl mb-8 font-light">
            Weddings, Birthdays, Parties & More - Share your special moments with stunning digital invitations
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="text-lg px-8 py-6 bg-primary hover:bg-primary-hover"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-center text-primary mb-16">
            Everything You Need
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Countdown Timer</h3>
              <p className="text-muted-foreground">Real-time countdown to your special day</p>
            </div>
            <div className="text-center">
              <Image className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Photo Gallery</h3>
              <p className="text-muted-foreground">Showcase your memorable moments</p>
            </div>
            <div className="text-center">
              <Gift className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Gift Registry</h3>
              <p className="text-muted-foreground">Share gift card and registry information</p>
            </div>
            <div className="text-center">
              <LinkIcon className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Custom Links</h3>
              <p className="text-muted-foreground">Auto-generated unique invitation URLs</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-6">
            Ready to Create Your Invitation?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Choose from weddings, birthdays, parties and more - start creating today
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="text-lg px-8 py-6 bg-primary hover:bg-primary-hover"
          >
            Create Your Invitation
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
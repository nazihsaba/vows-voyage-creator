import { useState, useRef } from "react";
import { Calendar, Church, Wine, PartyPopper, MapPin, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const TABS = [
  { id: "intro", label: "Intro" },
  { id: "timeline", label: "Timeline" },
  { id: "gifts", label: "Gift Registry" },
  { id: "rsvp", label: "RSVP" },
];

interface EnvelopeTemplatePreviewProps {
  groomName?: string;
  brideName?: string;
  weddingDate?: string;
}

export const EnvelopeTemplatePreview = ({
  groomName = "Michael",
  brideName = "Jessica",
  weddingDate = "2025-06-15",
}: EnvelopeTemplatePreviewProps) => {
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const touchStartY = useRef(0);

  const handleEnvelopeClick = () => {
    setIsEnvelopeOpen(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    
    if (diff > 50 && currentTab < TABS.length - 1) {
      setCurrentTab(prev => prev + 1);
    } else if (diff < -50 && currentTab > 0) {
      setCurrentTab(prev => prev - 1);
    }
  };

  // Get couple initials for wax seal
  const groomInitial = groomName?.charAt(0)?.toUpperCase() || "M";
  const brideInitial = brideName?.charAt(0)?.toUpperCase() || "J";

  const renderEnvelopeScreen = () => (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer"
      onClick={handleEnvelopeClick}
      style={{ 
        background: "linear-gradient(145deg, #f5f3f0 0%, #ebe8e3 50%, #e5e2dc 100%)"
      }}
    >
      {/* Paper texture overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Envelope */}
      <div className="relative w-[90vw] max-w-[400px] aspect-[4/5]">
        {/* Envelope body */}
        <div 
          className="absolute inset-0 bg-[#f8f6f3] shadow-2xl"
          style={{
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)",
          }}
        />
        
        {/* Top flap (triangle) */}
        <div 
          className="absolute top-0 left-0 right-0 h-[45%]"
          style={{
            background: "linear-gradient(180deg, #f0ede8 0%, #e8e5e0 100%)",
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        />

        {/* Left side fold line */}
        <div 
          className="absolute bottom-0 left-0 w-[50%] h-[55%]"
          style={{
            background: "linear-gradient(135deg, transparent 0%, rgba(0,0,0,0.02) 100%)",
            clipPath: "polygon(0 0, 100% 100%, 0 100%)",
          }}
        />

        {/* Right side fold line */}
        <div 
          className="absolute bottom-0 right-0 w-[50%] h-[55%]"
          style={{
            background: "linear-gradient(-135deg, transparent 0%, rgba(0,0,0,0.02) 100%)",
            clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
          }}
        />

        {/* Wax Seal */}
        <div 
          className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
        >
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
            style={{
              background: "radial-gradient(circle at 35% 35%, #f5f0e8 0%, #e8e0d5 30%, #d8d0c5 70%, #c8c0b5 100%)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15), inset 0 -2px 8px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.3)",
            }}
          >
            {/* Inner circle */}
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: "radial-gradient(circle at 40% 40%, #f0ebe3 0%, #e0d8ce 50%, #d5cdc3 100%)",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <span 
                className="text-2xl tracking-wide"
                style={{
                  fontFamily: "'Dancing Script', cursive",
                  color: "#a09080",
                  textShadow: "0 1px 1px rgba(255,255,255,0.5)",
                }}
              >
                {groomInitial}&{brideInitial}
              </span>
            </div>
          </div>
        </div>

        {/* Exclusive invitation text */}
        <div className="absolute bottom-[20%] left-0 right-0 text-center px-8">
          <p 
            className="text-xl md:text-2xl leading-relaxed"
            style={{
              fontFamily: "'Dancing Script', cursive",
              color: "#8a7a6a",
            }}
          >
            Esta invitación es<br />exclusiva para ti
          </p>
        </div>

        {/* Tap to open hint */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-xs text-gray-400 animate-pulse">
            Tap to open
          </p>
        </div>
      </div>
    </div>
  );

  const renderIntroTab = () => (
    <div className="flex flex-col h-[calc(100vh-57px)] overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center relative overflow-hidden">
        {/* Bible Verse Quote */}
        <div className="mb-8">
          <p className="text-lg md:text-xl italic text-[#7a4c4c] font-serif max-w-md mx-auto">
            "Two are better than one. For if they fall, one will lift up the other."
          </p>
          <p className="text-sm text-gray-600 mt-2">- Ecclesiastes 4:9-12</p>
        </div>

        {/* Together with their families */}
        <div className="mb-6">
          <p className="text-xl md:text-2xl text-gray-800">
            Together with their families
          </p>
        </div>

        {/* Parents Names */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 mb-6">
          <div className="text-center">
            <p className="text-sm md:text-base text-[#c4a35a] italic">Mr. & Mrs. Smith</p>
            <p className="text-2xl md:text-3xl font-cursive text-gray-800">Smith</p>
          </div>

          <span className="text-2xl text-gray-400">&</span>

          <div className="text-center">
            <p className="text-sm md:text-base text-[#c4a35a] italic">Mr. & Mrs. Johnson</p>
            <p className="text-2xl md:text-3xl font-cursive text-gray-800">Johnson</p>
          </div>
        </div>

        {/* Invitation Text */}
        <div className="mb-6">
          <p className="text-base md:text-lg text-gray-700 whitespace-pre-line">
            joyfully invite you to the wedding of their{"\n"}beloved son and daughter
          </p>
        </div>

        {/* Couple Names */}
        <div className="mb-6">
          <h1 className="text-4xl md:text-6xl font-cursive text-gray-800">
            {groomName} & {brideName}
          </h1>
        </div>

        {/* Wedding Date */}
        <div>
          <p className="text-lg md:text-xl text-[#c4a35a]">
            {new Date(weddingDate).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Decorative Botanical Elements */}
        <div className="absolute bottom-4 left-6 opacity-40">
          <svg width="60" height="100" viewBox="0 0 60 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 100V50M30 50C20 40 10 35 5 30M30 50C25 45 20 42 15 40M30 50C35 45 40 42 45 40M30 50C40 40 50 35 55 30" stroke="#9ca3af" strokeWidth="1.5"/>
            <ellipse cx="5" cy="28" rx="8" ry="12" fill="none" stroke="#9ca3af" strokeWidth="1" transform="rotate(-30 5 28)"/>
            <ellipse cx="15" cy="38" rx="6" ry="10" fill="none" stroke="#9ca3af" strokeWidth="1" transform="rotate(-20 15 38)"/>
            <ellipse cx="45" cy="38" rx="6" ry="10" fill="none" stroke="#9ca3af" strokeWidth="1" transform="rotate(20 45 38)"/>
            <ellipse cx="55" cy="28" rx="8" ry="12" fill="none" stroke="#9ca3af" strokeWidth="1" transform="rotate(30 55 28)"/>
          </svg>
        </div>

        {/* Corner Decorations */}
        <div className="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-gray-300 rounded-br-lg" />
      </div>
    </div>
  );

  const renderTimelineTab = () => {
    const weddingDateObj = new Date(weddingDate);
    const dateFormatted = weddingDateObj.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
    });

    const timelineEvents = [
      {
        id: "ceremony",
        title: "Ceremony",
        time: "4:00 PM",
        location: "St. Mary's Cathedral",
        icon: Church,
      },
      {
        id: "welcome",
        title: "Welcome Drink",
        time: "5:30 PM",
        location: "The Grand Ballroom",
        icon: Wine,
      },
      {
        id: "dinner",
        title: "Dinner & Party",
        time: "7:00 PM",
        location: "The Grand Ballroom",
        icon: PartyPopper,
      },
    ];

    return (
      <div className="flex flex-col h-[calc(100vh-57px)] overflow-hidden">
        <div className="flex-1 px-6 py-8 relative overflow-hidden">
          {/* Date Header */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <Calendar className="w-6 h-6 text-gray-600" />
            <h2 className="text-3xl md:text-4xl font-cursive text-gray-800 italic">
              {dateFormatted}
            </h2>
          </div>

          {/* Vertical Timeline */}
          <div className="relative max-w-md mx-auto">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300 -translate-x-1/2" />

            <div className="space-y-12">
              {timelineEvents.map((event, index) => (
                <div 
                  key={event.id} 
                  className="relative flex items-start"
                >
                  <div className="flex-1 text-right pr-8">
                    <h3 className="font-medium text-gray-800">{event.title}</h3>
                    <p className="text-sm font-semibold text-gray-700">{event.time}</p>
                  </div>

                  <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-800 rounded-full z-10" />

                  <div className="flex-1 pl-8">
                    <event.icon className="w-6 h-6 text-gray-700 mb-2" />
                    <p className="text-sm text-gray-600 leading-snug">{event.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Corner Decoration */}
          <div className="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-gray-300 rounded-br-lg" />
        </div>
      </div>
    );
  };

  const handleCopyCard = (cardNumber: string) => {
    navigator.clipboard.writeText(cardNumber);
    toast.success("Card number copied!");
  };

  const renderGiftsTab = () => {
    const sampleGiftCards = [
      { id: "1", card_name: "Wedding Fund", card_number: "1234-5678-9012-3456" },
      { id: "2", card_name: "Honeymoon Fund", card_number: "9876-5432-1098-7654" },
    ];

    return (
      <div className="flex flex-col h-[calc(100vh-57px)] overflow-hidden">
        <div className="flex-1 px-6 py-12 overflow-hidden">
          <h2 className="text-3xl md:text-4xl font-cursive text-center text-gray-800 mb-12">
            Gift Registry
          </h2>

          <div className="space-y-4 max-w-md mx-auto">
            {sampleGiftCards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{card.card_name}</p>
                    <p className="text-sm text-gray-500 font-mono">{card.card_number}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyCard(card.card_number)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Decorative element */}
          <div className="absolute bottom-4 left-6 opacity-40">
            <svg width="60" height="100" viewBox="0 0 60 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M30 100V50M30 50C20 40 10 35 5 30M30 50C25 45 20 42 15 40M30 50C35 45 40 42 45 40M30 50C40 40 50 35 55 30" stroke="#9ca3af" strokeWidth="1.5"/>
              <ellipse cx="5" cy="28" rx="8" ry="12" fill="none" stroke="#9ca3af" strokeWidth="1" transform="rotate(-30 5 28)"/>
              <ellipse cx="15" cy="38" rx="6" ry="10" fill="none" stroke="#9ca3af" strokeWidth="1" transform="rotate(-20 15 38)"/>
              <ellipse cx="45" cy="38" rx="6" ry="10" fill="none" stroke="#9ca3af" strokeWidth="1" transform="rotate(20 45 38)"/>
              <ellipse cx="55" cy="28" rx="8" ry="12" fill="none" stroke="#9ca3af" strokeWidth="1" transform="rotate(30 55 28)"/>
            </svg>
          </div>

          {/* Corner Decoration */}
          <div className="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-gray-300 rounded-br-lg" />
        </div>
      </div>
    );
  };

  const renderRsvpTab = () => (
    <div className="flex flex-col h-[calc(100vh-57px)] overflow-hidden">
      <div className="flex-1 px-6 py-12 overflow-auto">
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl md:text-4xl font-cursive text-center text-gray-800 mb-8">
            RSVP
          </h2>

          <div className="bg-[#faf8f5] rounded-xl p-6">
            <p className="text-center text-gray-600 mb-6">
              Please let us know if you can join us on our special day. Your presence would mean the world to us.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-gray-200">
                <span className="text-gray-800 font-medium">Guest Name</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Will Attend?</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">Please RSVP by:</p>
              <p className="text-lg font-medium text-[#7a4c4c]">
                May 15, 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentTab = () => {
    switch (TABS[currentTab]?.id) {
      case "intro":
        return renderIntroTab();
      case "timeline":
        return renderTimelineTab();
      case "gifts":
        return renderGiftsTab();
      case "rsvp":
        return renderRsvpTab();
      default:
        return renderIntroTab();
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] relative">
      {/* Envelope Screen - Only show if not opened */}
      {!isEnvelopeOpen && renderEnvelopeScreen()}

      {/* Main Content - Only show after envelope is opened */}
      {isEnvelopeOpen && (
        <div 
          className="min-h-screen"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Tab Navigation */}
          <nav className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur-sm border-b border-gray-200">
            <div className="flex justify-center gap-1 p-2">
              {TABS.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(index)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    currentTab === index
                      ? "bg-[#a78b71] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Tab Content */}
          <main className="h-[calc(100vh-57px)] overflow-hidden">
            {renderCurrentTab()}
          </main>
        </div>
      )}
    </div>
  );
};

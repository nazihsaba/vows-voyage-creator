import { useState, useRef } from "react";
import { ChevronUp, Calendar, Church, Wine, PartyPopper, MapPin, Copy } from "lucide-react";

const TABS = [
  { id: "intro", label: "Intro" },
  { id: "timeline", label: "Timeline" },
  { id: "gifts", label: "Gift Registry" },
  { id: "rsvp", label: "RSVP" },
];

export const BibleVerseTabsPreview = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const touchStartY = useRef<number | null>(null);

  const goToNextTab = () => {
    if (currentTab < TABS.length - 1) {
      setCurrentTab(currentTab + 1);
    }
  };

  const goToPrevTab = () => {
    if (currentTab > 0) {
      setCurrentTab(currentTab - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    
    // Swipe up - go to next tab
    if (diff > 50) {
      goToNextTab();
    }
    // Swipe down - go to previous tab
    if (diff < -50) {
      goToPrevTab();
    }
    touchStartY.current = null;
  };

  const renderIntroTab = () => (
    <div className="h-full flex flex-col px-6 py-6 text-center relative overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Bible Verse Quote */}
        <div className="mb-8 animate-fade-in">
          <p className="text-lg md:text-xl italic text-[#7a4c4c] font-serif max-w-md mx-auto">
            "Two are better than one. For if they fall, one will lift up the other."
          </p>
          <p className="text-sm text-gray-600 mt-2">- Ecclesiastes 4:9-12</p>
        </div>

        {/* Together with their families */}
        <div className="mb-6">
          <p className="text-xl md:text-2xl text-gray-800">Together with their families</p>
        </div>

        {/* Parents Names */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 mb-6">
          {/* Groom's Parents */}
          <div className="text-center">
            <p className="text-sm md:text-base text-[#c4a35a] italic">Mr. Pierre & Mrs. Nayla</p>
            <p className="text-2xl md:text-3xl font-cursive text-gray-800">Nawfal</p>
          </div>

          <span className="text-2xl text-gray-400">&</span>

          {/* Bride's Parents */}
          <div className="text-center">
            <p className="text-sm md:text-base text-[#c4a35a] italic">Mr. Michel & Mrs. Layla</p>
            <p className="text-2xl md:text-3xl font-cursive text-gray-800">Assaker</p>
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
          <h1 className="text-4xl md:text-6xl font-cursive text-gray-800">Stephan & Chadia</h1>
        </div>

        {/* Wedding Date */}
        <div>
          <p className="text-lg md:text-xl text-[#c4a35a]">Saturday, August 16th, 2025</p>
        </div>

        {/* Decorative Botanical Elements */}
        <div className="absolute bottom-16 left-6 opacity-40">
          <svg width="60" height="100" viewBox="0 0 60 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 100V50M30 50C20 40 10 35 5 30M30 50C25 45 20 42 15 40M30 50C35 45 40 42 45 40M30 50C40 40 50 35 55 30" stroke="#9ca3af" strokeWidth="1.5"/>
            <ellipse cx="5" cy="28" rx="8" ry="12" fill="none" stroke="#9ca3af" strokeWidth="1" transform="rotate(-30 5 28)"/>
            <ellipse cx="15" cy="38" rx="6" ry="10" fill="none" stroke="#9ca3af" strokeWidth="1" transform="rotate(-20 15 38)"/>
            <ellipse cx="45" cy="38" rx="6" ry="10" fill="none" stroke="#9ca3af" strokeWidth="1" transform="rotate(20 45 38)"/>
            <ellipse cx="55" cy="28" rx="8" ry="12" fill="none" stroke="#9ca3af" strokeWidth="1" transform="rotate(30 55 28)"/>
          </svg>
        </div>
      </div>

      {/* Swipe Up Indicator - Fixed at bottom with dedicated space */}
      {currentTab < TABS.length - 1 && (
        <button 
          onClick={goToNextTab}
          className="flex flex-col items-center text-gray-400 animate-bounce cursor-pointer hover:text-gray-600 transition-colors py-2"
        >
          <ChevronUp className="w-6 h-6" />
          <span className="text-xs">Swipe up</span>
        </button>
      )}

      {/* Corner Decorations */}
      <div className="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-gray-300 rounded-br-lg" />
    </div>
  );

  const renderTimelineTab = () => {
    const timelineEvents = [
      {
        id: "ceremony",
        title: "Ceremony",
        time: "7:00 PM",
        location: "Couvent Saint Sauveur - Sarba",
        icon: Church,
      },
      {
        id: "welcome",
        title: "Welcome Drink",
        time: "8:00 PM",
        location: "Carma - Jeita Country Club",
        icon: Wine,
      },
      {
        id: "dinner",
        title: "Dinner & Party",
        time: "9:00 PM",
        location: "Carma - Jeita Country Club",
        icon: PartyPopper,
      },
    ];

    return (
      <div className="h-full flex flex-col px-8 py-4 relative overflow-hidden">
        {/* Date Header */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <Calendar className="w-7 h-7 text-gray-600" />
          <h2 className="text-3xl md:text-4xl font-cursive text-gray-800 italic">
            16 August
          </h2>
        </div>

        {/* Vertical Timeline - Centered and expanded */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden">
          <div className="relative w-full max-w-lg">
            {/* Vertical Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300 -translate-x-1/2" />

            {/* Timeline Events */}
            <div className="space-y-10">
              {timelineEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="relative flex items-start"
                >
                  {/* Left Side - Event Name & Time */}
                  <div className="flex-1 text-right pr-8">
                    <h3 className="text-base font-medium text-gray-800">{event.title}</h3>
                    <p className="text-sm font-semibold text-gray-700">{event.time}</p>
                  </div>

                  {/* Center Dot */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-800 rounded-full z-10" />

                  {/* Right Side - Icon, Location & Link */}
                  <div className="flex-1 pl-8">
                    <event.icon className="w-6 h-6 text-gray-700 mb-1" />
                    <p className="text-sm text-gray-600 leading-snug">{event.location}</p>
                    <a
                      href="#"
                      className="inline-flex items-center gap-1 text-sm text-gray-800 underline mt-1 hover:text-gray-600 transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                      Location
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative Botanical Elements - Bottom Left */}
        <div className="absolute bottom-16 left-8 opacity-40">
          <svg width="60" height="100" viewBox="0 0 60 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 100V50M30 50C20 40 10 35 5 30M30 50C25 45 20 42 15 40M30 50C35 45 40 42 45 40M30 50C40 40 50 35 55 30" stroke="#9ca3af" strokeWidth="1.5"/>
            <ellipse cx="5" cy="28" rx="8" ry="12" fill="none" stroke="#9ca3af" strokeWidth="1" transform="rotate(-30 5 28)"/>
            <ellipse cx="15" cy="38" rx="6" ry="10" fill="none" stroke="#9ca3af" strokeWidth="1" transform="rotate(-20 15 38)"/>
            <ellipse cx="45" cy="38" rx="6" ry="10" fill="none" stroke="#9ca3af" strokeWidth="1" transform="rotate(20 45 38)"/>
            <ellipse cx="55" cy="28" rx="8" ry="12" fill="none" stroke="#9ca3af" strokeWidth="1" transform="rotate(30 55 28)"/>
          </svg>
        </div>

        {/* Swipe Up Indicator - Fixed at bottom with dedicated space */}
        {currentTab < TABS.length - 1 && (
          <button 
            onClick={goToNextTab}
            className="flex flex-col items-center text-gray-400 animate-bounce cursor-pointer hover:text-gray-600 transition-colors py-2"
          >
            <ChevronUp className="w-6 h-6" />
            <span className="text-xs">Swipe up</span>
          </button>
        )}

        {/* Corner Decoration */}
        <div className="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-gray-300 rounded-br-lg" />
      </div>
    );
  };

  const renderGiftsTab = () => (
    <div className="h-full flex flex-col px-8 py-6 relative overflow-hidden">
      {/* Content Container - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-cursive text-gray-800 mb-6">
          Gift Registry
        </h2>
        
        {/* Welcome Message */}
        <p className="text-lg md:text-xl text-[#7a4c4c] max-w-md mx-auto leading-relaxed mb-8">
          We're so excited to celebrate this special day with you.
        </p>
        
        {/* Registry Info */}
        <p className="text-base md:text-lg text-gray-800 italic max-w-sm mx-auto mb-6">
          For those who wish, a wedding registry is available:
        </p>
        
        {/* Wish Account */}
        <div className="flex flex-col items-center">
          <p className="text-base font-medium text-gray-800 mb-3">Wish account:</p>
          <button 
            className="inline-flex items-center gap-4 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => navigator.clipboard.writeText("30278878")}
          >
            <span className="text-base text-gray-800"># 30278878</span>
            <Copy className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Decorative Botanical Elements - Bottom Left */}
      <div className="absolute bottom-16 left-8 opacity-40">
        <svg width="60" height="100" viewBox="0 0 60 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 100V50M30 50C20 40 10 35 5 30M30 50C25 45 20 42 15 40M30 50C35 45 40 42 45 40M30 50C40 40 50 35 55 30" stroke="#9ca3af" strokeWidth="1.5"/>
          <ellipse cx="5" cy="28" rx="8" ry="12" fill="none" stroke="#9ca3af" strokeWidth="1" transform="rotate(-30 5 28)"/>
          <ellipse cx="15" cy="38" rx="6" ry="10" fill="none" stroke="#9ca3af" strokeWidth="1" transform="rotate(-20 15 38)"/>
          <ellipse cx="45" cy="38" rx="6" ry="10" fill="none" stroke="#9ca3af" strokeWidth="1" transform="rotate(20 45 38)"/>
          <ellipse cx="55" cy="28" rx="8" ry="12" fill="none" stroke="#9ca3af" strokeWidth="1" transform="rotate(30 55 28)"/>
        </svg>
      </div>

      {/* Swipe Up Indicator - Fixed at bottom with dedicated space */}
      {currentTab < TABS.length - 1 && (
        <button 
          onClick={goToNextTab}
          className="flex flex-col items-center text-gray-400 animate-bounce cursor-pointer hover:text-gray-600 transition-colors py-2"
        >
          <ChevronUp className="w-6 h-6" />
          <span className="text-xs">Swipe up</span>
        </button>
      )}

      {/* Corner Decoration */}
      <div className="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-gray-300 rounded-br-lg" />
    </div>
  );

  const renderRsvpTab = () => (
    <div className="h-full flex flex-col px-8 py-4 relative overflow-hidden">
      {/* Content Container - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
        {/* Monogram */}
        <div className="w-14 h-14 rounded-full border-2 border-gray-400 flex items-center justify-center mb-4">
          <span className="text-base text-gray-600 font-serif">S <span className="text-xs">&</span> C</span>
        </div>

        {/* Heading */}
        <h2 className="text-xl md:text-2xl text-gray-700 mb-4 leading-relaxed">
          Your presence means the<br />world to us
        </h2>
        
        {/* Couple Names */}
        <p className="text-2xl md:text-3xl font-cursive text-gray-800 italic mb-4">
          Elie & Maya
        </p>
        
        {/* Reply Deadline */}
        <p className="text-sm text-[#7a4c4c] mb-2">
          Please reply before 1 August, 2025
        </p>
        
        {/* Number of Persons */}
        <p className="text-sm text-gray-700 mb-4">
          Number of persons invited: <span className="font-semibold">2</span>
        </p>
        
        {/* Attending Question */}
        <p className="text-base font-medium text-gray-800 mb-2">Are you attending?</p>
        <div className="flex items-center justify-center gap-6 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="attending" value="yes" className="w-4 h-4" />
            <span className="text-sm text-gray-700">Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="attending" value="no" className="w-4 h-4" />
            <span className="text-sm text-gray-700">No</span>
          </label>
        </div>
        
        {/* Wishes */}
        <p className="text-sm text-gray-700 mb-2">Share your love & wishes:</p>
        <textarea 
          placeholder="Write here (Optional)"
          className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 resize-none mb-4"
          rows={2}
        />
        
        {/* Submit Button */}
        <button className="px-10 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm hover:bg-gray-300 transition-colors">
          Submit
        </button>
      </div>

      {/* Decorative Botanical Elements - Bottom Left */}
      <div className="absolute bottom-12 left-8 opacity-40">
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
  );

  const renderTabContent = () => {
    switch (TABS[currentTab].id) {
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
    <div className="relative w-full h-screen bg-white overflow-hidden">
      {/* Watercolor Header Effect */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#d4e5f7]/60 via-[#e8f0f7]/30 to-transparent pointer-events-none z-10" />

      {/* Tab Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="flex justify-center gap-4 md:gap-8 px-4 py-4">
          {TABS.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(index)}
              className={`text-sm md:text-base transition-colors ${
                currentTab === index
                  ? "text-gray-900 font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Tab Content - Fixed height, no scroll */}
      <main 
        className="h-[calc(100vh-57px)] overflow-hidden transition-opacity duration-300"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {renderTabContent()}
      </main>
    </div>
  );
};

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const TABS = [
  { id: "intro", label: "Intro" },
  { id: "timeline", label: "Timeline" },
  { id: "gifts", label: "Gift Registry" },
  { id: "rsvp", label: "RSVP" },
];

export const BibleVerseTabsPreview = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const renderIntroTab = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 py-12 text-center relative">
      {/* Bible Verse Quote */}
      <div className="mb-12 animate-fade-in">
        <p className="text-lg md:text-xl italic text-[#7a4c4c] font-serif max-w-md mx-auto">
          "Two are better than one. For if they fall, one will lift up the other."
        </p>
        <p className="text-sm text-gray-600 mt-2">- Ecclesiastes 4:9-12</p>
      </div>

      {/* Together with their families */}
      <div className="mb-10">
        <p className="text-xl md:text-2xl text-gray-800">Together with their families</p>
      </div>

      {/* Parents Names */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mb-10">
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
      <div className="mb-8">
        <p className="text-base md:text-lg text-gray-700 whitespace-pre-line">
          joyfully invite you to the wedding of their{"\n"}beloved son and daughter
        </p>
      </div>

      {/* Couple Names */}
      <div className="mb-8">
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

      {/* Swipe Up Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-gray-400 animate-bounce">
        <ChevronDown className="w-6 h-6 rotate-180" />
        <span className="text-xs mt-1">Swipe up</span>
      </div>

      {/* Corner Decorations */}
      <div className="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-gray-300 rounded-br-lg" />
    </div>
  );

  const renderTimelineTab = () => (
    <div className="min-h-[80vh] px-6 py-12">
      <h2 className="text-3xl md:text-4xl font-cursive text-center text-gray-800 mb-12">
        Wedding Timeline
      </h2>

      {/* Countdown placeholder */}
      <div className="mb-12 bg-[#faf8f5] rounded-xl p-6 text-center">
        <p className="text-sm text-gray-500 mb-2">Counting down to</p>
        <div className="flex justify-center gap-4">
          {[
            { value: "120", label: "Days" },
            { value: "14", label: "Hours" },
            { value: "32", label: "Minutes" },
            { value: "45", label: "Seconds" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-3xl font-bold text-[#7a4c4c]">{item.value}</div>
              <div className="text-xs text-gray-500">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Events */}
      <div className="space-y-6">
        <div className="bg-[#faf8f5] rounded-xl p-6">
          <h3 className="text-xl font-semibold text-[#7a4c4c] mb-4">The Ceremony</h3>
          <p className="text-gray-700 mb-2">4:00 PM</p>
          <p className="text-gray-600">St. Patrick's Cathedral, NYC</p>
          <button className="mt-4 px-6 py-2 bg-[#a78b71] text-white rounded-full text-sm hover:bg-[#8b725c] transition-colors">
            View Location
          </button>
        </div>

        <div className="bg-[#faf8f5] rounded-xl p-6">
          <h3 className="text-xl font-semibold text-[#7a4c4c] mb-4">The Reception</h3>
          <p className="text-gray-700 mb-2">6:00 PM</p>
          <p className="text-gray-600">The Plaza Hotel, Grand Ballroom</p>
          <button className="mt-4 px-6 py-2 bg-[#a78b71] text-white rounded-full text-sm hover:bg-[#8b725c] transition-colors">
            View Location
          </button>
        </div>
      </div>
    </div>
  );

  const renderGiftsTab = () => (
    <div className="min-h-[80vh] px-6 py-12">
      <h2 className="text-3xl md:text-4xl font-cursive text-center text-gray-800 mb-12">
        Gift Registry
      </h2>
      <div className="max-w-md mx-auto space-y-4">
        <div className="bg-[#faf8f5] rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-sm">
            <span className="text-2xl">🎁</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Your presence is our gift</h3>
          <p className="text-gray-600 text-sm">
            If you wish to bless us with a gift, we have registered at the following stores.
          </p>
        </div>
      </div>
    </div>
  );

  const renderRsvpTab = () => (
    <div className="min-h-[80vh] px-6 py-12">
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
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-sm text-gray-600">Will Attend?</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">Please RSVP by:</p>
            <p className="text-lg font-medium text-[#7a4c4c]">July 15, 2025</p>
          </div>
        </div>
      </div>
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
    <div className="relative w-full min-h-screen bg-white">
      {/* Watercolor Header Effect */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#d4e5f7]/60 via-[#e8f0f7]/30 to-transparent pointer-events-none" />

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

      {/* Tab Content */}
      <main className="transition-opacity duration-300">
        {renderTabContent()}
      </main>
    </div>
  );
};

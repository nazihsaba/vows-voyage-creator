import { Calendar, Church, Wine, PartyPopper, MapPin, Copy } from "lucide-react";
import galleryCouple1 from "@/assets/gallery-couple-1.jpg";
import galleryCouple2 from "@/assets/gallery-couple-2.jpg";
import galleryCouple3 from "@/assets/gallery-couple-3.jpg";
import galleryCouple4 from "@/assets/gallery-couple-4.jpg";
import galleryCouple5 from "@/assets/gallery-couple-5.jpg";
import galleryCouple6 from "@/assets/gallery-couple-6.jpg";

export const BibleVerseTabsPreview = () => {
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
    <div className="relative w-full min-h-screen bg-white overflow-y-auto font-serif text-[#3e2723]">
      {/* Watercolor Header Effect */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#d4e5f7]/60 via-[#e8f0f7]/30 to-transparent pointer-events-none z-10" />

      {/* Scrollable Content */}
      <div className="px-6 py-12">
        {/* ===== INTRO SECTION ===== */}
        <section className="min-h-[80vh] flex flex-col items-center justify-center text-center mb-16">
          {/* Bible Verse Quote */}
          <div className="mb-8 animate-fade-in">
            <p className="text-template-body max-w-md mx-auto">
              "Two are better than one. For if they fall, one will lift up the other."
            </p>
            <p className="text-template-small mt-2">- Ecclesiastes 4:9-12</p>
          </div>

          {/* Together with their families */}
          <div className="mb-6">
            <p className="text-template-body">Together with their families</p>
          </div>

          {/* Parents Names */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 mb-6">
            {/* Groom's Parents */}
            <div className="text-center">
              <p className="text-primary font-semibold">Mr. Pierre & Mrs. Nayla</p>
              <p className="text-template-subtitle">Nawfal</p>
            </div>

            <span className="text-2xl text-gray-400">&</span>

            {/* Bride's Parents */}
            <div className="text-center">
              <p className="text-primary font-semibold">Mr. Michel & Mrs. Layla</p>
              <p className="text-template-subtitle">Assaker</p>
            </div>
          </div>

          {/* Invitation Text */}
          <div className="mb-6">
            <p className="text-template-body whitespace-pre-line">
              joyfully invite you to the wedding of their{"\n"}beloved son and daughter
            </p>
          </div>

          {/* Couple Names */}
          <div className="mb-6">
            <h1 className="text-template-title">Stephan & Chadia</h1>
          </div>

          {/* Wedding Date */}
          <div>
            <p className="text-template-body text-primary">Saturday, August 16th, 2025</p>
          </div>
        </section>

        {/* Divider */}
        <div className="w-24 h-0.5 bg-gray-300 mx-auto mb-16" />

        {/* ===== TIMELINE SECTION ===== */}
        <section className="mb-16">
          {/* Date Header */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <Calendar className="w-7 h-7 text-primary" />
            <h2 className="text-template-subtitle">16 August</h2>
          </div>

          {/* Vertical Timeline */}
          <div className="relative max-w-lg mx-auto">
            {/* Vertical Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300 -translate-x-1/2" />

            {/* Timeline Events */}
            <div className="space-y-12">
              {timelineEvents.map((event) => (
                <div key={event.id} className="relative flex items-start">
                  {/* Left Side - Event Name & Time */}
                  <div className="flex-1 text-right pr-8">
                    <h3 className="text-template-body font-medium">{event.title}</h3>
                    <p className="text-template-body font-semibold">{event.time}</p>
                  </div>

                  {/* Center Dot */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full z-10" />

                  {/* Right Side - Icon, Location & Link */}
                  <div className="flex-1 pl-8">
                    <event.icon className="w-6 h-6 mb-1 text-primary" />
                    <p className="text-template-small text-gray-600 leading-snug">{event.location}</p>
                    <a
                      href="#"
                      className="inline-flex items-center gap-1 text-template-small underline mt-1 hover:text-primary transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                      Location
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="w-24 h-0.5 bg-gray-300 mx-auto mb-16" />

        {/* ===== GALLERY SECTION ===== */}
        <section className="mb-16">
          <h2 className="text-template-subtitle text-center text-primary mb-8">Our Moments</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              galleryCouple1,
              galleryCouple2,
              galleryCouple3,
              galleryCouple4,
              galleryCouple5,
              galleryCouple6,
            ].map((src, index) => (
              <div key={index} className="aspect-square overflow-hidden rounded-lg shadow-soft bg-gray-200">
                <img src={src} alt={`Wedding moment ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="w-24 h-0.5 bg-gray-300 mx-auto mb-16" />

        {/* ===== GIFTS SECTION ===== */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-template-subtitle text-center mb-12 text-primary">Wedding Gift</h2>
            <p className="text-center text-template-body mb-8 text-gray-600">
              For those who desire a wedding list is available
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { id: "1", card_name: "OMT", card_number: "123456789" },
                { id: "2", card_name: "Whish", card_number: "123456789" },
              ].map((card) => (
                <div key={card.id} className="bg-[#faf8f5] p-6 rounded-lg text-center">
                  <p className="font-semibold text-lg text-[#3e2723]">{card.card_name}</p>
                  <p className="text-gray-600 mt-2">{card.card_number}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="w-24 h-0.5 bg-gray-300 mx-auto mb-16" />

        {/* ===== RSVP SECTION ===== */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-template-subtitle text-center mb-12 text-primary">Join Our Celebration</h2>

            <p className="text-template-body text-center text-gray-600">
              Please let us know if you can join us on our special day. Your presence would mean the world to us.
            </p>

            <div className="pt-8 border-t border-gray-300">
              <p className="text-template-small text-center mb-2 text-gray-600">
                Kindly confirm your attendance before this date:
              </p>
              <p className="text-template-heading text-primary text-center">August 1, 2025</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

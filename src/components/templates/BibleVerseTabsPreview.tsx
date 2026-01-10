import { Calendar, Church, Wine, PartyPopper, MapPin, Copy } from "lucide-react";

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
    <div className="relative w-full min-h-screen bg-white overflow-y-auto">
      {/* Watercolor Header Effect */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#d4e5f7]/60 via-[#e8f0f7]/30 to-transparent pointer-events-none z-10" />

      {/* Scrollable Content */}
      <div className="px-6 py-12">
        {/* ===== INTRO SECTION ===== */}
        <section className="min-h-[80vh] flex flex-col items-center justify-center text-center mb-16">
          {/* Bible Verse Quote */}
          <div className="mb-8 animate-fade-in">
            <p className="text-lg md:text-xl  font-[Roboto] max-w-md mx-auto">
              "Two are better than one. For if they fall, one will lift up the other."
            </p>
            <p className="text-sm text-gray-600 mt-2 font-[Roboto]">- Ecclesiastes 4:9-12</p>
          </div>

          {/* Together with their families */}
          <div className="mb-6">
            <p className="text-xl md:text-2xl  font-[Roboto]">Together with their families</p>
          </div>

          {/* Parents Names */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 mb-6">
            {/* Groom's Parents */}
            <div className="text-center">
              <p className="text-sm md:text-base text-[#c4a35a]  font-[Roboto]">Mr. Pierre & Mrs. Nayla</p>
              <p className="text-2xl md:text-3xl font-cursive ">Nawfal</p>
            </div>

            <span className="text-2xl text-gray-400 font-[Roboto]">&</span>

            {/* Bride's Parents */}
            <div className="text-center">
              <p className="text-sm md:text-base text-[#c4a35a]  font-[Roboto]">Mr. Michel & Mrs. Layla</p>
              <p className="text-2xl md:text-3xl font-cursive ">Assaker</p>
            </div>
          </div>

          {/* Invitation Text */}
          <div className="mb-6">
            <p className="text-lg md:text-xl whitespace-pre-line font-[Roboto]">
              joyfully invite you to the wedding of their{"\n"}beloved son and daughter
            </p>
          </div>

          {/* Couple Names */}
          <div className="mb-6">
            <h1 className="text-4xl md:text-6xl font-cursive ">Stephan & Chadia</h1>
          </div>

          {/* Wedding Date */}
          <div>
            <p className="text-lg md:text-xl text-[#c4a35a] font-[Roboto]">Saturday, August 16th, 2025</p>
          </div>
        </section>

        {/* Divider */}
        <div className="w-24 h-0.5 bg-gray-300 mx-auto mb-16" />

        {/* ===== TIMELINE SECTION ===== */}
        <section className="mb-16">
          {/* Date Header */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <Calendar className="w-7 h-7 text-gray-600" />
            <h2 className="text-3xl md:text-4xl font-cursive  italic">16 August</h2>
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
                    <h3 className="text-base font-medium ">{event.title}</h3>
                    <p className="text-sm font-semibold">{event.time}</p>
                  </div>

                  {/* Center Dot */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-800 rounded-full z-10" />

                  {/* Right Side - Icon, Location & Link */}
                  <div className="flex-1 pl-8">
                    <event.icon className="w-6 h-6 mb-1" />
                    <p className="text-sm text-gray-600 leading-snug">{event.location}</p>
                    <a
                      href="#"
                      className="inline-flex items-center gap-1 text-sm  underline mt-1 hover:text-gray-600 transition-colors"
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
          <h2 className="text-3xl md:text-4xl font-cursive text-center  mb-8">Our Moments</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=400&fit=crop",
            ].map((src, index) => (
              <div key={index} className="aspect-square overflow-hidden rounded-lg shadow-md bg-gray-200">
                <img src={src} alt={`Wedding moment ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="w-24 h-0.5 bg-gray-300 mx-auto mb-16" />

        {/* ===== GIFTS SECTION ===== */}
        <section className="mb-16 text-center">
          {/* Heading */}
          <h2 className="text-3xl md:text-4xl font-cursive  mb-6">Gift Registry</h2>

          {/* Welcome Message */}
          <p className="text-lg md:text-xl  max-w-md mx-auto leading-relaxed mb-8 font-[Roboto]">
            We're so excited to celebrate this special day with you.
          </p>

          {/* Registry Info */}
          <p className="text-base md:text-lg  font-[Roboto] max-w-sm mx-auto mb-6">
            For those who wish, a wedding registry is available:
          </p>

          {/* Wish Account */}
          <div className="flex flex-col items-center">
            <p className="text-base font-medium  mb-3">Wish account:</p>
            <button
              className="inline-flex items-center gap-4 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => navigator.clipboard.writeText("30278878")}
            >
              <span className="text-base "># 30278878</span>
              <Copy className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </section>

        {/* Divider */}
        <div className="w-24 h-0.5 bg-gray-300 mx-auto mb-16" />

        {/* ===== RSVP SECTION ===== */}
        <section className="mb-16 text-center max-w-md mx-auto">
          {/* Monogram */}
          <div className="w-14 h-14 rounded-full border-2 border-gray-400 flex items-center justify-center mb-4 mx-auto">
            <span className="text-base text-gray-600 font-serif">
              S <span className="text-xs">&</span> C
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-xl md:text-2xl mb-4 leading-relaxed">
            Your presence means the
            <br />
            world to us
          </h2>

          {/* Couple Names */}
          <p className="text-2xl md:text-3xl font-cursive  italic mb-4">Elie & Maya</p>

          {/* Reply Deadline */}
          <p className="text-sm  mb-2">Please reply before 1 August, 2025</p>

          {/* Number of Persons */}
          <p className="text-sm mb-4">
            Number of persons invited: <span className="font-semibold">2</span>
          </p>

          {/* Attending Question */}
          <p className="text-base font-medium  mb-2">Are you attending?</p>
          <div className="flex items-center justify-center gap-6 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="attending" value="yes" className="w-4 h-4" />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="attending" value="no" className="w-4 h-4" />
              <span className="text-sm">No</span>
            </label>
          </div>

          {/* Wishes */}
          <p className="text-sm mb-2">Share your love & wishes:</p>
          <textarea
            placeholder="Write here (Optional)"
            className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm placeholder-gray-400 resize-none mb-4 mx-auto block"
            rows={2}
          />

          {/* Submit Button */}
          <button className="px-10 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm hover:bg-gray-300 transition-colors">
            Submit
          </button>
        </section>

        {/* Decorative Botanical Elements */}
        <div className="flex justify-center opacity-40 pb-8">
          <svg width="60" height="100" viewBox="0 0 60 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M30 100V50M30 50C20 40 10 35 5 30M30 50C25 45 20 42 15 40M30 50C35 45 40 42 45 40M30 50C40 40 50 35 55 30"
              stroke="#9ca3af"
              strokeWidth="1.5"
            />
            <ellipse
              cx="5"
              cy="28"
              rx="8"
              ry="12"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="1"
              transform="rotate(-30 5 28)"
            />
            <ellipse
              cx="15"
              cy="38"
              rx="6"
              ry="10"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="1"
              transform="rotate(-20 15 38)"
            />
            <ellipse
              cx="45"
              cy="38"
              rx="6"
              ry="10"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="1"
              transform="rotate(20 45 38)"
            />
            <ellipse
              cx="55"
              cy="28"
              rx="8"
              ry="12"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="1"
              transform="rotate(30 55 28)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

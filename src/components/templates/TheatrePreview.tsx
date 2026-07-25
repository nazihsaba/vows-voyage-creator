import { TheatreTemplate } from "./TheatreTemplate";
import etoile1 from "@/assets/etoile-1.jpg";
import etoile2 from "@/assets/etoile-2.jpg";
import etoile3 from "@/assets/etoile-3.jpg";

const sampleWedding = {
  id: "preview",
  groom_name: "Elie",
  bride_name: "Clara",
  groom_family: "Karam Family",
  bride_family: "Nassar Family",
  wedding_date: "2026-08-16",
  main_picture_url: etoile1,
  main_photo_position: 50,
  main_description:
    "With joy in our hearts we invite you to a single evening of ceremony, supper, and celebration — the culmination of a story we have been rehearsing for years.",
  rsvp_deadline: "2026-08-01",
  wishes_enabled: true,
};

const sampleLocations = [
  {
    type: "ceremony",
    location_name: "Couvent Saint Sauveur — Sarba",
    location_link: "https://maps.google.com/?q=Couvent+Saint+Sauveur",
    time: "18:00",
    display_order: 1,
  },
  {
    type: "welcome_drink",
    location_name: "Carma — Jeita Country Club",
    time: "20:00",
    display_order: 2,
  },
  {
    type: "venue",
    location_name: "Carma — Jeita Country Club",
    location_link: "https://maps.google.com/?q=Carma+Jeita",
    time: "20:30",
    display_order: 3,
  },
];

const sampleGallery = [
  { id: "1", image_url: etoile1 },
  { id: "2", image_url: etoile2 },
  { id: "3", image_url: etoile3 },
];

const sampleGifts = [
  { id: "1", card_name: "OMT", card_number: "123 456 789" },
  { id: "2", card_name: "Whish", card_number: "987 654 321" },
];

const TheatrePreview = () => {
  return (
    <TheatreTemplate
      wedding={sampleWedding}
      locations={sampleLocations}
      gallery={sampleGallery}
      giftCards={sampleGifts}
      isPreview
      onFieldUpdate={() => {}}
      getFieldValue={(_id, def) => def}
      getFieldStyle={() => ({})}
      invitees={[
        { id: "1", name: "Daniel Farah" },
        { id: "2", name: "Sara Mansour" },
      ]}
      rsvpResponses={{}}
      handleRsvpToggle={() => {}}
      handleRsvpSubmit={() => {}}
      numberOfPersons={0}
    />
  );
};

export default TheatrePreview;

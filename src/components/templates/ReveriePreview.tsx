import { getPreviewDates } from "@/lib/previewDates";
import { ReverieTemplate } from "./ReverieTemplate";
import gallery1 from "@/assets/reverie/gallery-1.jpg";
import gallery2 from "@/assets/reverie/gallery-2.jpg";
import gallery3 from "@/assets/reverie/gallery-3.jpg";
import gallery4 from "@/assets/reverie/gallery-4.jpg";

const previewDates = getPreviewDates();

const sampleWedding = {
  id: "preview",
  groom_name: "Rami",
  bride_name: "Nour",
  groom_family: "Haddad",
  bride_family: "Khoury",
  wedding_date: previewDates.weddingDateString,
  main_description:
    "Request the pleasure of your company as they celebrate their marriage and begin this new chapter surrounded by the people they love most.",
  rsvp_deadline: previewDates.rsvpDeadlineString,
  wishes_enabled: true,
  template_type: "dentelle-lace",
};

const sampleLocations = [
  {
    type: "ceremony",
    location_name: "Saint Elie Church",
    location_link: "https://maps.google.com/?q=Saint+Elie+Church+Beirut",
    time: "17:00",
    display_order: 1,
  },
  {
    type: "welcome_drink",
    location_name: "Villa Lumière Gardens",
    time: "18:30",
    display_order: 2,
  },
  {
    type: "venue",
    location_name: "Villa Lumière",
    location_link: "https://maps.google.com/?q=Beirut",
    note: "Set among old stone arches and jasmine gardens. We recommend arriving a little early to settle in before the celebration begins.",
    time: "20:00",
    display_order: 3,
  },
];

const sampleGallery = [gallery1, gallery2, gallery3, gallery4].map((image_url, i) => ({
  id: `sample-${i + 1}`,
  image_url,
  image_order: i + 1,
  position_y: 40,
}));

const sampleGifts = [
  { id: "1", card_name: "OMT", card_number: "123 456 789" },
  { id: "2", card_name: "Whish", card_number: "987 654 321" },
];

const ReveriePreview = () => {
  return (
    <ReverieTemplate
      wedding={sampleWedding}
      locations={sampleLocations}
      gallery={sampleGallery}
      giftCards={sampleGifts}
      isPreview={false}
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

export default ReveriePreview;

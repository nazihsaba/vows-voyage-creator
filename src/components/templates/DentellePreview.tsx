import { DentelleTemplate } from "./DentelleTemplate";

const sampleWedding = {
  id: "preview",
  groom_name: "Rami",
  bride_name: "Nour",
  groom_family: "Haddad",
  bride_family: "Khoury",
  wedding_date: "2027-05-20",
  main_description:
    "Request the pleasure of your company as they celebrate their marriage and begin this new chapter surrounded by the people they love most.",
  rsvp_deadline: "2027-05-01",
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

const sampleGifts = [
  { id: "1", card_name: "OMT", card_number: "123 456 789" },
  { id: "2", card_name: "Whish", card_number: "987 654 321" },
];

const DentellePreview = () => {
  return (
    <DentelleTemplate
      wedding={sampleWedding}
      locations={sampleLocations}
      gallery={[]}
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

export default DentellePreview;

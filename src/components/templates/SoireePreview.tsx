import { SoireeTemplate } from "./SoireeTemplate";
import lumiere1 from "@/assets/lumiere-1.jpg";
import lumiere2 from "@/assets/lumiere-2.jpg";
import lumiere3 from "@/assets/lumiere-3.jpg";
import lumiere4 from "@/assets/lumiere-4.jpg";
import lumiere5 from "@/assets/lumiere-5.jpg";
import lumiere6 from "@/assets/lumiere-6.jpg";

const sampleWedding = {
  bride_name: "Aurélie",
  groom_name: "Maxime",
  wedding_date: "2026-08-16",
  hero_media: lumiere1,
  aura_quote:
    "And now these three remain: faith, hope and love. But the greatest of these is love.",
  aura_reference: "A promise, gently kept",
  main_description: "Together we begin our forever.",
};

const sampleLocations = [
  {
    type: "ceremony",
    location_name: "Couvent Saint Sauveur — Sarba",
    location_link: "https://maps.google.com/?q=Couvent+Saint+Sauveur+Sarba",
    time: "19:00",
    icon: "material-symbols:church-rounded",
  },
  {
    type: "venue",
    location_name: "Carma — Jeita Country Club",
    location_link: "https://maps.google.com/?q=Carma+Jeita+Country+Club",
    time: "21:00",
    icon: "solar:confetti-bold",
  },
];

const sampleGallery = [
  { id: "1", image_url: lumiere2 },
  { id: "2", image_url: lumiere3 },
  { id: "3", image_url: lumiere4 },
  { id: "4", image_url: lumiere5 },
  { id: "5", image_url: lumiere6 },
];

const SoireePreview = () => (
  <SoireeTemplate
    wedding={sampleWedding}
    locations={sampleLocations}
    gallery={sampleGallery}
    giftCards={[
      { id: "g1", card_name: "Bride's Account", card_number: "1234 5678 9012 3456" },
      { id: "g2", card_name: "Groom's Account", card_number: "9876 5432 1098 7654" },
    ]}
    isPreview={true}
    onFieldUpdate={() => {}}
    getFieldValue={(_, d) => d}
    getFieldStyle={() => ({})}
  />
);

export default SoireePreview;

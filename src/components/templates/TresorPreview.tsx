import { TresorTemplate } from "./TresorTemplate";
import tresor1 from "@/assets/tresor/tresor-1.jpeg";
import tresor2 from "@/assets/tresor/tresor-2.jpeg";
import tresor3 from "@/assets/tresor/tresor-3.jpeg";
import tresor4 from "@/assets/tresor/tresor-4.jpeg";
import tresor5 from "@/assets/tresor/tresor-5.jpeg";
import tresor6 from "@/assets/tresor/tresor-6.jpeg";
import tresor7 from "@/assets/tresor/tresor-7.jpeg";
import tresor8 from "@/assets/tresor/tresor-8.jpeg";

const sampleWedding = {
  bride_name: "Aurélie",
  groom_name: "Maxime",
  wedding_date: "2026-08-16",
  hero_media: tresor3,
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
  { id: "1", image_url: tresor3 },
  { id: "2", image_url: tresor4 },
  { id: "3", image_url: tresor6 },
  { id: "4", image_url: tresor1 },
  { id: "5", image_url: tresor5 },
  { id: "6", image_url: tresor2 },
  { id: "7", image_url: tresor8 },
  { id: "8", image_url: tresor7 },
];

const TresorPreview = () => (
  <TresorTemplate
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

export default TresorPreview;

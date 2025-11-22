import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ArrowLeft, Video, Images, MapPin, Gift, Clock, LayoutGrid } from "lucide-react";
import modernRomance from "@/assets/template-modern-romance.jpg";
import cinematicVideo from "@/assets/template-cinematic-video.jpg";
import elegantTabs from "@/assets/template-elegant-tabs.jpg";

const WeddingTemplates = () => {
  const navigate = useNavigate();

  const weddingTemplates = [
    { 
      id: "elegant-tabs",
      name: "Elegant Tabs",
      description: "Modern tabbed interface with rose gold accents", 
      image: elegantTabs,
      features: [
        { icon: LayoutGrid, text: "Tabbed Layout" },
        { icon: MapPin, text: "Event Locations" },
        { icon: Clock, text: "Countdown Timer" }
      ]
    },
    { 
      id: "template2",
      name: "Modern Romance",
      description: "Contemporary design with stunning gallery showcase", 
      image: modernRomance,
      features: [
        { icon: Images, text: "Photo Gallery" },
        { icon: MapPin, text: "Event Locations" },
        { icon: Gift, text: "Gift Registry" },
        { icon: Clock, text: "Countdown Timer" }
      ]
    },
    { 
      id: "template6", 
      name: "Cinematic Video", 
      description: "Immersive full-screen video background experience", 
      image: cinematicVideo,
      features: [
        { icon: Video, text: "Video Background" },
        { icon: MapPin, text: "Event Locations" },
        { icon: Gift, text: "Gift Registry" },
        { icon: Clock, text: "Countdown Timer" }
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="bg-white shadow-soft sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-rose-500" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-primary">
                Wedding Templates
              </h1>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard/select-event-type")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <p className="text-base sm:text-lg text-muted-foreground text-center">
            Choose a template to create your perfect wedding invitation
          </p>
        </div>
        
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {weddingTemplates.map((template) => (
            <Card
              key={template.id}
              className="shadow-soft hover:shadow-elegant transition-all cursor-pointer hover:scale-[1.02] flex flex-col"
              onClick={() => {
                if (template.id === 'elegant-tabs') {
                  navigate('/create/elegant-tabs');
                } else {
                  navigate(`/dashboard/create?eventType=weddings&template=${template.id}`);
                }
              }}
            >
              <CardHeader className="p-4 sm:p-6 flex-grow">
                <div className="aspect-video rounded-lg overflow-hidden mb-3 sm:mb-4">
                  <img 
                    src={template.image} 
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle className="text-lg sm:text-xl font-serif">{template.name}</CardTitle>
                <CardDescription className="text-sm sm:text-base">{template.description}</CardDescription>
                
                {/* Features List */}
                {template.features && (
                  <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
                    {template.features.map((feature, idx) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <Badge 
                          key={idx} 
                          variant="secondary" 
                          className="text-xs flex items-center gap-1 py-1"
                        >
                          <FeatureIcon className="w-3 h-3" />
                          {feature.text}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 mt-auto">
                <Button className="w-full text-sm sm:text-base">Use This Template</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default WeddingTemplates;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, LogOut, Cake, PartyPopper, Gift, TreePine, Baby, Calendar, Video, Images, MapPin, Gift as GiftIcon, Clock, GlassWater, Sparkles } from "lucide-react";
import modernRomance from "@/assets/template-modern-romance.jpg";
import cinematicVideo from "@/assets/template-cinematic-video.jpg";
import roseGoldTabs from "@/assets/template-rose-gold-tabs.jpg";
import birthdayTemplate from "@/assets/template-birthday.jpg";
import christmasTemplate from "@/assets/template-christmas.jpg";
import baptismTemplate from "@/assets/template-baptism.jpg";
import anniversaryTemplate from "@/assets/template-anniversary.jpg";

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const templateCategories = [
    {
      id: "weddings",
      name: "Weddings",
      icon: Heart,
      color: "text-rose-500",
      templates: [
        { 
          id: "template2", 
          name: "Modern Romance", 
          description: "Contemporary design with stunning gallery showcase", 
          image: modernRomance,
          features: [
            { icon: Images, text: "Photo Gallery" },
            { icon: MapPin, text: "Event Locations" },
            { icon: GiftIcon, text: "Gift Registry" },
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
            { icon: GiftIcon, text: "Gift Registry" },
            { icon: Clock, text: "Countdown Timer" }
          ]
        },
        { 
          id: "rose-gold-tabs", 
          name: "Rose Gold Tabs", 
          description: "Fullscreen video background with elegant page transitions", 
          image: roseGoldTabs,
          features: [
            { icon: Video, text: "Video Background" },
            { icon: Sparkles, text: "Page Transitions" },
            { icon: MapPin, text: "Event Locations" },
            { icon: Clock, text: "Countdown Timer" }
          ]
        },
      ],
    },
    {
      id: "birthdays",
      name: "Birthdays",
      icon: Cake,
      color: "text-amber-500",
      templates: [
        { id: "template1", name: "Coming soon", description: "Fun and colorful design", disabled: true, image: birthdayTemplate },
        { id: "template2", name: "Coming soon", description: "Perfect for special ages", disabled: true },
        { id: "template3", name: "Coming soon", description: "Coming soon", disabled: true },
      ],
    },
    {
      id: "christmas",
      name: "Christmas Dinners",
      icon: TreePine,
      color: "text-green-600",
      templates: [
        { id: "template1", name: "Coming soon", description: "Traditional Christmas theme", disabled: true, image: christmasTemplate },
        { id: "template2", name: "Coming soon", description: "Elegant holiday design", disabled: true },
        { id: "template3", name: "Coming soon", description: "Coming soon", disabled: true },
      ],
    },
    {
      id: "baptisms",
      name: "Baptisms",
      icon: Baby,
      color: "text-blue-400",
      templates: [
        { id: "template1", name: "Coming soon", description: "Classic baptism invitation", disabled: true, image: baptismTemplate },
        { id: "template2", name: "Coming soon", description: "Modern and elegant", disabled: true },
        { id: "template3", name: "Coming soon", description: "Coming soon", disabled: true },
      ],
    },
    {
      id: "anniversaries",
      name: "Anniversaries",
      icon: Heart,
      color: "text-purple-500",
      templates: [
        { id: "template1", name: "Coming soon", description: "Celebrate your journey together", disabled: true, image: anniversaryTemplate },
        { id: "template2", name: "Coming soon", description: "Perfect for milestone anniversaries", disabled: true },
        { id: "template3", name: "Coming soon", description: "Coming soon", disabled: true },
      ],
    },
    {
      id: "bachelor",
      name: "Bachelor",
      icon: GlassWater,
      color: "text-indigo-500",
      templates: [
        { id: "template1", name: "Coming soon", description: "Versatile event template", disabled: true },
        { id: "template2", name: "Coming soon", description: "Flexible design for any occasion", disabled: true },
        { id: "template3", name: "Coming soon", description: "Coming soon", disabled: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="bg-white shadow-soft sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-primary text-center sm:text-left">
                Choose Your Template
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Button 
                onClick={() => navigate("/dashboard/my-events")}
                className="flex-1 sm:flex-none"
              >
                My Events
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="flex-1 sm:flex-none"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Exit</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Filter Chips */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge
              variant={selectedCategory === null ? "default" : "outline"}
              className="cursor-pointer px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-primary/10 transition-colors"
              onClick={() => setSelectedCategory(null)}
            >
              All Events
            </Badge>
            {templateCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Badge
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className="cursor-pointer px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-primary/10 transition-colors"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Icon className={`w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 ${selectedCategory === category.id ? '' : category.color}`} />
                  {category.name}
                </Badge>
              );
            })}
          </div>
        </div>
        
        <div className="space-y-8 sm:space-y-12">
          {templateCategories
            .filter(category => selectedCategory === null || category.id === selectedCategory)
            .map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.id}>
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${category.color}`} />
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
                    {category.name}
                  </h2>
                </div>
                
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {category.templates.map((template) => (
                    <Card
                      key={template.id}
                      className={`shadow-soft hover:shadow-elegant transition-all flex flex-col ${
                        template.disabled ? "opacity-50" : "cursor-pointer hover:scale-[1.02]"
                      }`}
                      onClick={() => {
                        if (!template.disabled) {
                          if (template.id === 'rose-gold-tabs') {
                            navigate(`/dashboard/rose-gold-tabs-form?template=${template.id}`);
                          } else {
                            navigate(`/dashboard/create?eventType=${category.id}&template=${template.id}`);
                          }
                        }
                      }}
                    >
                      <CardHeader className="p-4 sm:p-6 flex-grow">
                        <div className="aspect-video rounded-lg overflow-hidden mb-3 sm:mb-4">
                          {template.image ? (
                            <img 
                              src={template.image} 
                              alt={template.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              <Icon className={`w-12 h-12 sm:w-16 sm:h-16 ${category.color} opacity-50`} />
                            </div>
                          )}
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
                        {!template.disabled && (
                          <Button className="w-full text-sm sm:text-base">Use This Template</Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
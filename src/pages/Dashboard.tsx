import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, LogOut, Cake, PartyPopper, Gift, TreePine, Baby, Calendar } from "lucide-react";
import { templates } from "@/config/templates";
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

  // Get wedding templates from config
  const weddingTemplates = templates.map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    disabled: false,
    isPremium: template.isPremium,
  }));

  const templateCategories = [
    {
      id: "weddings",
      name: "Weddings",
      icon: Heart,
      color: "text-rose-500",
      templates: weddingTemplates,
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
      id: "other",
      name: "Other Events",
      icon: PartyPopper,
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
      <header className="bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">
              Choose Your Template
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate("/dashboard/my-events")}>
              My Events
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Chips */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge
              variant={selectedCategory === null ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm hover:bg-primary/10 transition-colors"
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
                  className="cursor-pointer px-4 py-2 text-sm hover:bg-primary/10 transition-colors"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Icon className={`w-4 h-4 mr-2 ${selectedCategory === category.id ? '' : category.color}`} />
                  {category.name}
                </Badge>
              );
            })}
          </div>
        </div>
        
        <div className="space-y-12">
          {templateCategories
            .filter(category => selectedCategory === null || category.id === selectedCategory)
            .map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.id}>
                <div className="flex items-center gap-3 mb-6">
                  <Icon className={`w-8 h-8 ${category.color}`} />
                  <h2 className="text-3xl font-serif font-bold text-foreground">
                    {category.name}
                  </h2>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {category.templates.map((template) => (
                    <Card
                      key={template.id}
                      className={`shadow-soft hover:shadow-elegant transition-all ${
                        template.disabled ? "opacity-50" : "cursor-pointer"
                      }`}
                      onClick={() =>
                        !template.disabled &&
                        navigate(`/dashboard/wedding-templates`)
                      }
                    >
                      <CardHeader>
                        <div className="aspect-video rounded-lg overflow-hidden mb-4">
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <Icon className={`w-16 h-16 ${category.color} opacity-50`} />
                          </div>
                        </div>
                        <CardTitle className="text-xl font-serif flex items-center gap-2">
                          {template.name}
                          {template.isPremium && (
                            <Badge variant="secondary" className="text-xs">Premium</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {!template.disabled && (
                          <Button className="w-full">Use This Template</Button>
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
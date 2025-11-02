import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, LogOut, Cake, PartyPopper, Gift, TreePine, Baby, Calendar } from "lucide-react";
import weddingClassic from "@/assets/template-wedding-classic.jpg";
import weddingModern from "@/assets/template-wedding-modern.jpg";
import birthdayTemplate from "@/assets/template-birthday.jpg";
import christmasTemplate from "@/assets/template-christmas.jpg";
import baptismTemplate from "@/assets/template-baptism.jpg";
import anniversaryTemplate from "@/assets/template-anniversary.jpg";

const Dashboard = () => {
  const navigate = useNavigate();

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
        { id: "template1", name: "Classic Elegance", description: "Traditional wedding invitation", image: weddingClassic },
        { id: "template2", name: "Modern Romance", description: "Contemporary design with gallery", image: weddingModern },
        { id: "template3", name: "Premium", description: "Coming soon", disabled: true },
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
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8 justify-center">
          <Button size="lg" onClick={() => navigate("/dashboard/my-events")}>
            My Events
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/dashboard/select-event-type")}>
            Create New Event
          </Button>
        </div>
        
        <div className="space-y-12">
          {templateCategories.map((category) => {
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
                        navigate(`/dashboard/create?eventType=${category.id}&template=${template.id}`)
                      }
                    >
                      <CardHeader>
                        <div className="aspect-video rounded-lg overflow-hidden mb-4">
                          {template.image ? (
                            <img 
                              src={template.image} 
                              alt={template.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              <Icon className={`w-16 h-16 ${category.color} opacity-50`} />
                            </div>
                          )}
                        </div>
                        <CardTitle className="text-xl font-serif">{template.name}</CardTitle>
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
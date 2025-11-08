import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ArrowLeft } from "lucide-react";
import weddingClassic from "@/assets/template-wedding-classic.jpg";
import weddingModern from "@/assets/template-wedding-modern.jpg";

const WeddingTemplates = () => {
  const navigate = useNavigate();

  const weddingTemplates = [
    { 
      id: "template1", 
      name: "Classic Elegance", 
      description: "Traditional wedding invitation with beautiful typography", 
      image: weddingClassic 
    },
    { 
      id: "template2", 
      name: "Modern Romance", 
      description: "Contemporary design with gallery and clean layouts", 
      image: weddingModern 
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-rose-500" />
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">
              Wedding Templates
            </h1>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-lg text-muted-foreground text-center">
            Choose a template to create your perfect wedding invitation
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {weddingTemplates.map((template) => (
            <Card
              key={template.id}
              className="shadow-soft hover:shadow-elegant transition-all cursor-pointer"
              onClick={() =>
                navigate(`/dashboard/create?eventType=weddings&template=${template.id}`)
              }
            >
              <CardHeader>
                <div className="aspect-video rounded-lg overflow-hidden mb-4">
                  <img 
                    src={template.image} 
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle className="text-xl font-serif">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Use This Template</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default WeddingTemplates;

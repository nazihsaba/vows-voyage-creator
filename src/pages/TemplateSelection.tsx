import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image } from "lucide-react";

const TemplateSelection = () => {
  const navigate = useNavigate();
  const { eventType } = useParams();

  const templates = [
    {
      id: "template1",
      name: "Classic Cover",
      description: "Simple and elegant with a single cover photo",
      features: ["Cover Photo", "Event Details", "Location Map", "Gift Cards"],
    },
    {
      id: "template2",
      name: "Gallery Showcase",
      description: "Includes cover photo and beautiful gallery section",
      features: ["Cover Photo", "Photo Gallery", "Event Details", "Location Map", "Gift Cards"],
    },
    {
      id: "template3",
      name: "Premium",
      description: "Coming soon - Full-featured premium template",
      features: ["Everything from Gallery", "Video Support", "RSVP Tracking"],
      disabled: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary capitalize">
            Choose {eventType} Template
          </h1>
          <Button variant="outline" onClick={() => navigate("/dashboard/select-event-type")}>
            Back
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`shadow-soft hover:shadow-elegant transition-all flex flex-col ${
                template.disabled ? "opacity-50" : "cursor-pointer"
              }`}
              onClick={() =>
                !template.disabled &&
                navigate(`/dashboard/create?eventType=${eventType}&template=${template.id}`)
              }
            >
              <CardHeader>
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center mb-4">
                  <Image className="w-16 h-16 text-primary opacity-50" />
                </div>
                <CardTitle className="text-xl font-serif">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <ul className="space-y-2 flex-grow">
                  {template.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full mt-4" 
                  disabled={template.disabled}
                >
                  {template.disabled ? "Coming Soon" : "Select Template"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TemplateSelection;

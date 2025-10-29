import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Cake, PartyPopper, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

const EventTypeSelection = () => {
  const navigate = useNavigate();

  const eventTypes = [
    {
      id: "wedding",
      title: "Wedding",
      description: "Create a beautiful wedding invitation",
      icon: Heart,
      color: "text-rose-500",
    },
    {
      id: "birthday",
      title: "Birthday",
      description: "Coming soon",
      icon: Cake,
      color: "text-amber-500",
      disabled: true,
    },
    {
      id: "party",
      title: "Party",
      description: "Coming soon",
      icon: PartyPopper,
      color: "text-purple-500",
      disabled: true,
    },
    {
      id: "other",
      title: "Other",
      description: "Coming soon",
      icon: Gift,
      color: "text-blue-500",
      disabled: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">
            Select Event Type
          </h1>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {eventTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card
                key={type.id}
                className={`shadow-soft hover:shadow-elegant transition-all ${
                  type.disabled ? "opacity-50" : "cursor-pointer"
                }`}
                onClick={() => !type.disabled && navigate(`/dashboard/select-template/${type.id}`)}
              >
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Icon className={`w-16 h-16 ${type.color}`} />
                  </div>
                  <CardTitle className="text-xl font-serif">{type.title}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default EventTypeSelection;

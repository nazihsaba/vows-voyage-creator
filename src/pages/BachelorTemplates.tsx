import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { templateConfig } from "@/config/templates";
import { TemplatePreviewLive } from "@/components/templates/TemplatePreviewLive";
import { GlassWater } from "lucide-react";

const BachelorTemplates = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Filter templates that are bachelor-specific
  const bachelorTemplates = templateConfig.templates.filter(
    (t) => t.id.startsWith('bachelor-')
  );

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      navigate(`/dashboard/bachelor-form?template=${selectedTemplate}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="bg-white shadow-soft sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <GlassWater className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">
                  Bachelor Party Templates
                </h1>
                <p className="text-muted-foreground mt-1">
                  Select a design for your bachelor party
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard/select-event-type")}>
              Back
            </Button>
          </div>

          {selectedTemplate && (
            <div className="flex items-center justify-between bg-primary/5 rounded-lg p-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">Template Selected</Badge>
                <span className="text-sm font-medium">
                  {templateConfig.templates.find(t => t.id === selectedTemplate)?.name}
                </span>
              </div>
              <Button onClick={handleContinue}>
                Continue with Template
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bachelorTemplates.map((template) => (
            <TemplatePreviewLive
              key={template.id}
              template={template}
              selected={selectedTemplate === template.id}
              onClick={() => handleTemplateSelect(template.id)}
            />
          ))}
        </div>

        {bachelorTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No bachelor templates available yet.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BachelorTemplates;

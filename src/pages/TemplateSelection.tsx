import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { templateConfig, getTemplatesByCategory, getPopularTemplates } from "@/config/templates";
import { TemplatePreviewLive } from "@/components/templates/TemplatePreviewLive";
import { TemplateCategory } from "@/types/templates";

const TemplateSelection = () => {
  const navigate = useNavigate();
  const { eventType } = useParams();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | TemplateCategory>('all');

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      navigate(`/dashboard/create?eventType=${eventType}&template=${selectedTemplate}`);
    }
  };

  const displayTemplates = activeCategory === 'all' 
    ? templateConfig.templates 
    : getTemplatesByCategory(activeCategory as TemplateCategory);

  const popularTemplates = getPopularTemplates();

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="bg-white shadow-soft sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary capitalize">
                Choose Your {eventType} Template
              </h1>
              <p className="text-muted-foreground mt-1">
                Select a design that matches your style
              </p>
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
        {/* Popular Templates */}
        {activeCategory === 'all' && popularTemplates.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
              ⭐ Popular Choices
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {popularTemplates.map((template) => (
                <TemplatePreviewLive
                  key={template.id}
                  template={template}
                  selected={selectedTemplate === template.id}
                  onClick={() => handleTemplateSelect(template.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as any)}>
          <TabsList className="mb-8 flex-wrap h-auto">
            <TabsTrigger value="all" className="capitalize">
              All Templates
            </TabsTrigger>
            {templateConfig.categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="capitalize">
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {displayTemplates.map((template) => (
                <TemplatePreviewLive
                  key={template.id}
                  template={template}
                  selected={selectedTemplate === template.id}
                  onClick={() => handleTemplateSelect(template.id)}
                />
              ))}
            </div>

            {displayTemplates.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No templates in this category yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};


export default TemplateSelection;

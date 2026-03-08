import { Template } from '@/types/templates';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, TrendingUp, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplatePreviewLiveProps {
  template: Template;
  selected?: boolean;
  onClick?: () => void;
}

export const TemplatePreviewLive = ({ template, selected, onClick }: TemplatePreviewLiveProps) => {
  return (
    <Card
      className={cn(
        "relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-elegant group",
        selected && "ring-2 ring-primary shadow-elegant"
      )}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div 
        className="aspect-[3/4] relative overflow-hidden"
        style={{ backgroundColor: template.style.colorScheme.accent }}
      >
        {/* Template Visual Preview */}
        <div className="absolute inset-0 p-6 flex flex-col items-center justify-center space-y-4">
          <div 
            className="text-center space-y-2"
            style={{ 
              fontFamily: template.style.fontPrimary,
              color: template.style.colorScheme.primary 
            }}
          >
            <div className={cn(
              "font-bold",
              template.style.headingSize === 'small' && "text-2xl",
              template.style.headingSize === 'medium' && "text-3xl",
              template.style.headingSize === 'large' && "text-4xl",
              template.style.headingSize === 'xl' && "text-5xl"
            )}>
              Sarah & Michael
            </div>
            <div 
              className="text-sm"
              style={{ 
                fontFamily: template.style.fontSecondary,
                color: template.style.colorScheme.text 
              }}
            >
              ARE GETTING MARRIED
            </div>
          </div>
          
          <div 
            className="w-16 h-px bg-current"
            style={{ backgroundColor: template.style.colorScheme.secondary }}
          />
          
          <div 
            className="text-center text-xs"
            style={{ 
              fontFamily: template.style.fontSecondary,
              color: template.style.colorScheme.text 
            }}
          >
            <div>June 15, 2025</div>
            <div className="mt-1 opacity-60">Garden Chapel</div>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          {template.isPremium && (
            <Badge variant="secondary" className="bg-amber-500 hover:bg-amber-600 text-white">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}
          {template.isPopular && (
            <Badge variant="secondary" className="bg-primary hover:bg-primary/90">
              <TrendingUp className="w-3 h-3 mr-1" />
              Popular
            </Badge>
          )}
        </div>

        {/* Selected Check */}
        {selected && (
          <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center z-10">
            <Check className="w-5 h-5 text-white" />
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 z-[5]" />
      </div>

      {/* Info */}
      <div className="p-4 space-y-2 bg-white">
        <h3 className="font-serif font-semibold text-lg">{template.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
        
        {/* Features */}
        <div className="flex flex-wrap gap-1 pt-2">
          {template.sections.slice(0, 4).map((section) => (
            <Badge key={section.id} variant="outline" className="text-xs capitalize">
              {section.id}
            </Badge>
          ))}
          {template.sections.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{template.sections.length - 4} more
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};

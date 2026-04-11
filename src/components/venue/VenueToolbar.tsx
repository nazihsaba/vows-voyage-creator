import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Circle, Square, RectangleHorizontal, Ellipsis, Grid3X3, Upload, Trash2, Sparkles, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  onAddTable: (shape: string) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  onUploadPlan: (file: File) => void;
  hasPlanImage: boolean;
  onRemovePlan: () => void;
  onDetectTables?: () => void;
  isDetecting?: boolean;
}

export const VenueToolbar: React.FC<Props> = ({
  onAddTable,
  showGrid,
  onToggleGrid,
  onUploadPlan,
  hasPlanImage,
  onRemovePlan,
  onDetectTables,
  isDetecting,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const shapes = [
    { id: "round", icon: Circle, label: "Round Table" },
    { id: "square", icon: Square, label: "Square Table" },
    { id: "rectangle", icon: RectangleHorizontal, label: "Rectangle Table" },
    { id: "oval", icon: Ellipsis, label: "Oval Table" },
  ];

  return (
    <TooltipProvider>
      <div className="w-14 bg-background border-r border-border/30 flex flex-col items-center py-3 gap-2">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Add</span>
        {shapes.map((s) => (
          <Tooltip key={s.id}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg hover:bg-primary/10"
                onClick={() => onAddTable(s.id)}
              >
                <s.icon className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{s.label}</TooltipContent>
          </Tooltip>
        ))}

        <div className="w-8 h-px bg-border/50 my-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={showGrid ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-lg"
              onClick={onToggleGrid}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Toggle Grid</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{hasPlanImage ? "Change Plan" : "Upload Plan"}</TooltipContent>
        </Tooltip>

        {hasPlanImage && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg text-destructive hover:bg-destructive/10"
                onClick={onRemovePlan}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Remove Plan</TooltipContent>
          </Tooltip>
        )}

        {hasPlanImage && onDetectTables && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg text-primary hover:bg-primary/10"
                onClick={onDetectTables}
                disabled={isDetecting}
              >
                {isDetecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{isDetecting ? "Detecting..." : "Detect Tables"}</TooltipContent>
          </Tooltip>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUploadPlan(f);
            e.target.value = "";
          }}
        />
      </div>
    </TooltipProvider>
  );
};

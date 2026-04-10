import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Circle, Square, RectangleHorizontal, Minus, Plus, RotateCcw, Upload } from "lucide-react";

interface VenueToolbarProps {
  onAddTable: (shape: string) => void;
  onUploadPlan: (file: File) => void;
  showGrid: boolean;
  onToggleGrid: (val: boolean) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

const VenueToolbar: React.FC<VenueToolbarProps> = ({
  onAddTable,
  onUploadPlan,
  showGrid,
  onToggleGrid,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const shapes = [
    { id: "round", label: "Round", icon: Circle },
    { id: "rectangle", label: "Rect", icon: RectangleHorizontal },
    { id: "square", label: "Square", icon: Square },
    { id: "oval", label: "Oval", icon: Minus },
  ];

  return (
    <div className="w-48 border-r bg-muted/20 p-3 flex flex-col gap-4 overflow-y-auto">
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Add Table</p>
        <div className="grid grid-cols-2 gap-1.5">
          {shapes.map((s) => (
            <Button
              key={s.id}
              variant="outline"
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-2 text-[10px]"
              onClick={() => onAddTable(s.id)}
            >
              <s.icon className="w-4 h-4" />
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Venue Plan</p>
        <input
          type="file"
          ref={fileRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUploadPlan(file);
          }}
        />
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="w-3.5 h-3.5 mr-1.5" />
          Upload Plan
        </Button>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">View</p>
        <div className="flex items-center gap-2 mb-3">
          <Switch
            id="grid-toggle"
            checked={showGrid}
            onCheckedChange={onToggleGrid}
          />
          <Label htmlFor="grid-toggle" className="text-xs">Show Grid</Label>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={onZoomOut}>
            <Minus className="w-3 h-3" />
          </Button>
          <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={onZoomIn}>
            <Plus className="w-3 h-3" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={onZoomReset}>
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VenueToolbar;

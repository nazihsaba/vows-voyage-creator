import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Trash2, Copy } from "lucide-react";
import type { VenueTable } from "@/hooks/useVenueProject";

interface VenueTablePropertiesProps {
  table: VenueTable;
  onChange: (updates: Partial<VenueTable>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const VenueTableProperties: React.FC<VenueTablePropertiesProps> = ({
  table,
  onChange,
  onDelete,
  onDuplicate,
}) => {
  return (
    <div className="w-56 border-l bg-muted/20 p-3 flex flex-col gap-3 overflow-y-auto">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Table Properties</p>

      <div className="space-y-1.5">
        <Label className="text-xs">Name</Label>
        <Input
          value={table.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Guest Count</Label>
        <Input
          type="number"
          min={0}
          value={table.guest_count}
          onChange={(e) => onChange({ guest_count: parseInt(e.target.value) || 0 })}
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Shape</Label>
        <Select value={table.shape} onValueChange={(val) => onChange({ shape: val })}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="round">Round</SelectItem>
            <SelectItem value="rectangle">Rectangle</SelectItem>
            <SelectItem value="square">Square</SelectItem>
            <SelectItem value="oval">Oval</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Width: {Math.round(table.width)}</Label>
        <Slider
          value={[table.width]}
          onValueChange={([v]) => onChange({ width: v })}
          min={30}
          max={300}
          step={5}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Height: {Math.round(table.height)}</Label>
        <Slider
          value={[table.height]}
          onValueChange={([v]) => onChange({ height: v })}
          min={30}
          max={300}
          step={5}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Rotation: {Math.round(table.rotation)}°</Label>
        <Slider
          value={[table.rotation]}
          onValueChange={([v]) => onChange({ rotation: v })}
          min={0}
          max={360}
          step={1}
        />
      </div>

      <div className="flex gap-2 mt-2">
        <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={onDuplicate}>
          <Copy className="w-3 h-3 mr-1" />
          Duplicate
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs h-8 border-destructive/30 text-destructive hover:bg-destructive/10"
          onClick={onDelete}
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
};

export default VenueTableProperties;

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Trash2, Copy } from "lucide-react";
import type { VenueTable } from "./VenueLayoutPlanner";

interface Props {
  table: VenueTable | null;
  onUpdate: (updates: Partial<VenueTable>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export const VenuePropertiesPanel: React.FC<Props> = ({ table, onUpdate, onDelete, onDuplicate }) => {
  if (!table) {
    return (
      <div className="w-56 bg-background border-l border-border/30 flex items-center justify-center p-4">
        <p className="text-xs text-muted-foreground text-center">Select a table to edit its properties</p>
      </div>
    );
  }

  return (
    <div className="w-56 bg-background border-l border-border/30 p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold text-foreground mb-4">Table Properties</h3>

      <div className="space-y-4">
        <div>
          <Label className="text-xs">Name</Label>
          <Input
            value={table.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="h-8 text-sm mt-1"
          />
        </div>

        <div>
          <Label className="text-xs">Guests</Label>
          <Input
            type="number"
            min={0}
            value={table.guest_count}
            onChange={(e) => onUpdate({ guest_count: parseInt(e.target.value) || 0 })}
            className="h-8 text-sm mt-1"
          />
        </div>

        <div>
          <Label className="text-xs">Shape</Label>
          <Select value={table.shape} onValueChange={(v) => onUpdate({ shape: v })}>
            <SelectTrigger className="h-8 text-sm mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="round">Round</SelectItem>
              <SelectItem value="square">Square</SelectItem>
              <SelectItem value="rectangle">Rectangle</SelectItem>
              <SelectItem value="oval">Oval</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {table.shape === "round" ? (
          <div>
            <Label className="text-xs">Diameter: {Math.round(table.width)}</Label>
            <Slider
              value={[table.width]}
              min={40}
              max={300}
              step={5}
              onValueChange={([v]) => onUpdate({ width: v, height: v })}
              className="mt-2"
            />
          </div>
        ) : (
          <>
            <div>
              <Label className="text-xs">Width: {Math.round(table.width)}</Label>
              <Slider
                value={[table.width]}
                min={40}
                max={300}
                step={5}
                onValueChange={([v]) => onUpdate({ width: v })}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-xs">Height: {Math.round(table.height)}</Label>
              <Slider
                value={[table.height]}
                min={40}
                max={300}
                step={5}
                onValueChange={([v]) => onUpdate({ height: v })}
                className="mt-2"
              />
            </div>
          </>
        )}

        <div>
          <Label className="text-xs">Rotation: {Math.round(table.rotation)}°</Label>
          <Slider
            value={[table.rotation]}
            min={0}
            max={360}
            step={5}
            onValueChange={([v]) => onUpdate({ rotation: v })}
            className="mt-2"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={onDuplicate}>
            <Copy className="w-3 h-3 mr-1" />
            Duplicate
          </Button>
          <Button variant="destructive" size="sm" className="flex-1 text-xs h-8" onClick={onDelete}>
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Trash2, Copy, ChevronLeft, ChevronRight } from "lucide-react";
import type { VenueTable } from "./VenueLayoutPlanner";

interface Props {
  table: VenueTable | null;
  onUpdate: (updates: Partial<VenueTable>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export const VenuePropertiesPanel: React.FC<Props> = ({ table, onUpdate, onDelete, onDuplicate }) => {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className="bg-background border-l border-border/30 flex flex-col items-center py-3 px-1">
        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setCollapsed(false)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-56 bg-background border-l border-border/30 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Table Properties</h3>
        <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setCollapsed(true)}>
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {!table ? (
        <p className="text-xs text-muted-foreground text-center">Select a table to edit its properties</p>
      ) : (
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
      )}
    </div>
  );
};

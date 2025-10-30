import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, X, Type, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldStyle {
  fontSize?: string;
  fontFamily?: string;
  color?: string;
  text?: string;
}

interface InlineFieldEditorProps {
  fieldId: string;
  currentText: string;
  currentStyle: FieldStyle;
  onSave: (text: string, style: FieldStyle) => void;
  onCancel: () => void;
  isLocked?: boolean;
  multiline?: boolean;
  className?: string;
}

const fontOptions = [
  { value: "Dancing Script", label: "Dancing Script" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Cormorant Garamond", label: "Cormorant Garamond" },
  { value: "Great Vibes", label: "Great Vibes" },
  { value: "Cinzel", label: "Cinzel" },
  { value: "Inter", label: "Inter" },
];

const fontSizes = [
  { value: "text-xs", label: "Extra Small" },
  { value: "text-sm", label: "Small" },
  { value: "text-base", label: "Base" },
  { value: "text-lg", label: "Large" },
  { value: "text-xl", label: "Extra Large" },
  { value: "text-2xl", label: "2XL" },
  { value: "text-3xl", label: "3XL" },
  { value: "text-4xl", label: "4XL" },
  { value: "text-5xl", label: "5XL" },
  { value: "text-6xl", label: "6XL" },
];

export const InlineFieldEditor = ({
  fieldId,
  currentText,
  currentStyle,
  onSave,
  onCancel,
  isLocked = false,
  multiline = false,
  className,
}: InlineFieldEditorProps) => {
  const [text, setText] = useState(currentText);
  const [style, setStyle] = useState<FieldStyle>(currentStyle);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setText(currentText);
    setStyle(currentStyle);
  }, [currentText, currentStyle]);

  useEffect(() => {
    // Close on escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onCancel]);

  const handleSave = () => {
    onSave(text, style);
  };

  return (
    <div 
      ref={editorRef}
      className={cn(
        "bg-white rounded-lg shadow-2xl border-2 border-primary p-4 min-w-[300px] max-w-[400px]",
        className
      )}
      style={{ zIndex: 10000 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="space-y-4">
        {/* Text Content - Only if not locked */}
        {!isLocked && (
          <div>
            <Label className="text-sm font-semibold mb-2">Content</Label>
            {multiline ? (
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                className="w-full"
              />
            ) : (
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full"
              />
            )}
          </div>
        )}

        {isLocked && (
          <div className="p-2 bg-muted/30 rounded text-sm">
            🔒 Content is locked. You can only change the style.
          </div>
        )}

        {/* Font Family */}
        <div>
          <Label className="text-sm font-semibold mb-2">Font</Label>
          <Select
            value={style.fontFamily || "Inter"}
            onValueChange={(value) => setStyle({ ...style, fontFamily: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
          <SelectContent className="bg-white z-[10000]">
            {fontOptions.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Font Size */}
        <div>
          <Label className="text-sm font-semibold mb-2">Size</Label>
          <Select
            value={style.fontSize || "text-base"}
            onValueChange={(value) => setStyle({ ...style, fontSize: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
          <SelectContent className="bg-white z-[10000]">
            {fontSizes.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Color */}
        <div>
          <Label className="text-sm font-semibold mb-2">Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={style.color || "#2C2C2C"}
              onChange={(e) => setStyle({ ...style, color: e.target.value })}
              className="w-20 h-10 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={style.color || "#2C2C2C"}
              onChange={(e) => setStyle({ ...style, color: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="p-3 bg-muted/20 rounded">
          <p className="text-xs text-muted-foreground mb-2">Preview:</p>
          <div
            style={{
              fontFamily: style.fontFamily || "Inter",
              color: style.color || "#2C2C2C",
            }}
            className={cn(style.fontSize || "text-base")}
          >
            {text}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button onClick={handleSave} size="sm" className="flex-1">
            <Check className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button onClick={onCancel} variant="outline" size="sm" className="flex-1">
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

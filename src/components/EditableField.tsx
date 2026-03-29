import { useState } from "react";
import { InlineFieldEditor } from "./InlineFieldEditor";
import { cn } from "@/lib/utils";
import { Edit3 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface FieldStyle {
  fontSize?: string;
  fontFamily?: string;
  color?: string;
  text?: string;
}

interface EditableFieldProps {
  fieldId: string;
  text: string;
  style?: FieldStyle;
  onUpdate: (fieldId: string, text: string, style: FieldStyle) => void;
  isLocked?: boolean;
  multiline?: boolean;
  className?: string;
  children?: React.ReactNode;
  tag?: keyof JSX.IntrinsicElements;
  isPreview?: boolean;
}

export const EditableField = ({
  fieldId,
  text,
  style = {},
  onUpdate,
  isLocked = false,
  multiline = false,
  className,
  children,
  tag = "span",
  isPreview = false,
}: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isMobile = useIsMobile();

  const handleClick = (e: React.MouseEvent) => {
    if (!isPreview) return;
    
    e.stopPropagation();

    if (!isMobile) {
      const rect = e.currentTarget.getBoundingClientRect();
      let x = rect.left + window.scrollX;
      let y = rect.bottom + window.scrollY + 8;
      
      if (x + 400 > window.innerWidth) {
        x = window.innerWidth - 420;
      }
      if (y + 500 > window.innerHeight + window.scrollY) {
        y = rect.top + window.scrollY - 508;
      }
      
      setPosition({ x, y });
    }
    
    setIsEditing(true);
  };

  const handleSave = (newText: string, newStyle: FieldStyle) => {
    onUpdate(fieldId, newText, newStyle);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const Tag = tag as any;

  const appliedStyle: React.CSSProperties = {
    ...(style.fontFamily && style.fontFamily.trim() ? { fontFamily: style.fontFamily } : {}),
    ...(style.color && style.color.trim() ? { color: style.color } : {}),
  };

  const fontSizeClass = style.fontSize && style.fontSize.trim() ? style.fontSize : undefined;

  if (!isPreview) {
    return (
      <Tag className={cn(className, fontSizeClass)} style={appliedStyle}>
        {children || text}
      </Tag>
    );
  }

  const editorContent = (
    <InlineFieldEditor
      fieldId={fieldId}
      currentText={text}
      currentStyle={style}
      onSave={handleSave}
      onCancel={handleCancel}
      isLocked={isLocked}
      multiline={multiline}
      className={isMobile ? "border-0 shadow-none p-0 min-w-0 w-full" : undefined}
    />
  );

  return (
    <>
      <Tag
        onClick={handleClick}
        className={cn(
          className,
          fontSizeClass,
          "cursor-pointer hover:outline hover:outline-2 hover:outline-primary/50 hover:bg-primary/5 rounded transition-all relative group"
        )}
        style={appliedStyle}
      >
        {children || text}
        <Edit3 className="w-3 h-3 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity text-primary bg-white rounded-full p-0.5 shadow" />
      </Tag>

      {isEditing && !isMobile && (
        <div
          style={{
            position: "fixed",
            left: `${position.x}px`,
            top: `${position.y}px`,
            zIndex: 9999,
          }}
        >
          {editorContent}
        </div>
      )}

      {isMobile && (
        <Sheet open={isEditing} onOpenChange={(open) => !open && handleCancel()}>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl px-4 pb-8">
            <SheetHeader className="pb-2">
              <SheetTitle className="text-base">Edit Field</SheetTitle>
            </SheetHeader>
            {editorContent}
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};

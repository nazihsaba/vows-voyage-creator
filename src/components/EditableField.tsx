import { useState } from "react";
import { InlineFieldEditor } from "./InlineFieldEditor";
import { cn } from "@/lib/utils";
import { Edit3 } from "lucide-react";

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

  const handleClick = (e: React.MouseEvent) => {
    if (!isPreview) return;
    
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Calculate position ensuring it stays within viewport
    let x = rect.left + window.scrollX;
    let y = rect.bottom + window.scrollY + 8;
    
    // Adjust if popup would go off right edge
    if (x + 400 > window.innerWidth) {
      x = window.innerWidth - 420; // 400 + 20 padding
    }
    
    // Adjust if popup would go off bottom edge
    if (y + 500 > window.innerHeight + window.scrollY) {
      y = rect.top + window.scrollY - 508; // Place above element
    }
    
    setPosition({ x, y });
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

  const appliedStyle = {
    fontFamily: style.fontFamily,
    color: style.color,
  };

  if (!isPreview) {
    return (
      <Tag className={cn(className, style.fontSize)} style={appliedStyle}>
        {children || text}
      </Tag>
    );
  }

  return (
    <>
      <Tag
        onClick={handleClick}
        className={cn(
          className,
          style.fontSize,
          "cursor-pointer hover:outline hover:outline-2 hover:outline-primary/50 hover:bg-primary/5 rounded transition-all relative group"
        )}
        style={appliedStyle}
      >
        {children || text}
        <Edit3 className="w-3 h-3 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity text-primary bg-white rounded-full p-0.5 shadow" />
      </Tag>

      {isEditing && (
        <div
          style={{
            position: "fixed",
            left: `${position.x}px`,
            top: `${position.y}px`,
            zIndex: 9999,
          }}
        >
          <InlineFieldEditor
            fieldId={fieldId}
            currentText={text}
            currentStyle={style}
            onSave={handleSave}
            onCancel={handleCancel}
            isLocked={isLocked}
            multiline={multiline}
          />
        </div>
      )}
    </>
  );
};

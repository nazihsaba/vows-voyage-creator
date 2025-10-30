import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface InlineEditableTextProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
  disabled?: boolean;
  onSave?: () => void;
}

export const InlineEditableText = ({
  value,
  onChange,
  className,
  multiline = false,
  placeholder = "Click to edit",
  disabled = false,
  onSave,
}: InlineEditableTextProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleClick = () => {
    if (!disabled) {
      setIsEditing(true);
      setEditValue(value);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    onChange(editValue);
    if (onSave) {
      onSave();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleBlur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(value);
    }
  };

  if (disabled) {
    return <span className={className}>{value}</span>;
  }

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            "bg-white/90 border-2 border-primary rounded px-2 py-1 outline-none resize-none",
            className
          )}
          rows={3}
        />
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "bg-white/90 border-2 border-primary rounded px-2 py-1 outline-none",
          className
        )}
      />
    );
  }

  return (
    <span
      onClick={handleClick}
      className={cn(
        "cursor-pointer hover:bg-white/20 rounded px-2 py-1 transition-colors inline-block",
        className
      )}
      title="Click to edit"
    >
      {value || placeholder}
    </span>
  );
};

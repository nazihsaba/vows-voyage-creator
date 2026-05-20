import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit2, Save, X, Palette, Type } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hexToHSL, hslToHex } from "@/lib/colorUtils";

interface EditableWeddingInviteProps {
  wedding: any;
  onUpdate: (updatedWedding: any) => void;
  children: React.ReactNode;
}

export const EditableWeddingInvite = ({ wedding, onUpdate, children }: EditableWeddingInviteProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    groom_family: wedding?.groom_family || "",
    bride_family: wedding?.bride_family || "",
    main_description: wedding?.main_description || "",
  });
  const [colors, setColors] = useState({
    primary: wedding?.custom_primary_color || "#E2C497",
    accent: wedding?.custom_accent_color || "#E6B7B8",
    text: wedding?.custom_text_color || "#2C2C2C",
  });
  const [fonts, setFonts] = useState({
    heading: wedding?.custom_font_heading || "Playfair Display",
    body: wedding?.custom_font_body || "Inter",
  });
  const [lockedNameStyle, setLockedNameStyle] = useState({
    fontFamily: wedding?.locked_name_style?.fontFamily || "Dancing Script",
    fontSize: wedding?.locked_name_style?.fontSize || "6xl",
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Apply colors and fonts immediately when they change
  useEffect(() => {
    const root = document.documentElement;
    
    // Convert hex to HSL for CSS variables
    root.style.setProperty("--primary", hexToHSL(colors.primary));
    root.style.setProperty("--accent", hexToHSL(colors.accent));
    root.style.setProperty("--foreground", hexToHSL(colors.text));
    
    console.log("Colors applied:", {
      primary: hexToHSL(colors.primary),
      accent: hexToHSL(colors.accent),
      text: hexToHSL(colors.text)
    });
  }, [colors]);

  const handleSave = async () => {
    if (!wedding?.id) {
      toast({
        title: "Error",
        description: "Wedding ID is missing",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    console.log("Saving data:", {
      ...editData,
      custom_primary_color: colors.primary,
      custom_accent_color: colors.accent,
      custom_text_color: colors.text,
      custom_font_heading: fonts.heading,
      custom_font_body: fonts.body,
      locked_name_style: lockedNameStyle,
    });

    try {
      const toTitleCase = (s: string) =>
        s.trim().replace(/\s+/g, " ").replace(/(^|\s)(\S)/g, (_m, s, c) => s + c.toUpperCase());
      const updateData = {
        ...editData,
        groom_family: editData.groom_family ? toTitleCase(editData.groom_family) : editData.groom_family,
        bride_family: editData.bride_family ? toTitleCase(editData.bride_family) : editData.bride_family,
        custom_primary_color: colors.primary,
        custom_accent_color: colors.accent,
        custom_text_color: colors.text,
        custom_font_heading: fonts.heading,
        custom_font_body: fonts.body,
        locked_name_style: lockedNameStyle,
      };

      const { data, error } = await supabase
        .from("weddings")
        .update(updateData)
        .eq("id", wedding.id)
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Save successful:", data);
      onUpdate(data);
      setIsEditing(false);
      toast({
        title: "Changes saved",
        description: "Your wedding details have been updated.",
      });
    } catch (error: any) {
      console.error("Error saving changes:", error);
      toast({
        title: "Error saving changes",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      groom_family: wedding?.groom_family || "",
      bride_family: wedding?.bride_family || "",
      main_description: wedding?.main_description || "",
    });
    setColors({
      primary: wedding?.custom_primary_color || "#E2C497",
      accent: wedding?.custom_accent_color || "#E6B7B8",
      text: wedding?.custom_text_color || "#2C2C2C",
    });
    setFonts({
      heading: wedding?.custom_font_heading || "Playfair Display",
      body: wedding?.custom_font_body || "Inter",
    });
    setLockedNameStyle({
      fontFamily: wedding?.locked_name_style?.fontFamily || "Dancing Script",
      fontSize: wedding?.locked_name_style?.fontSize || "6xl",
    });
    setIsEditing(false);
  };

  const fontOptions = [
    { value: "Dancing Script", label: "Dancing Script (Elegant Script)" },
    { value: "Playfair Display", label: "Playfair Display (Classic Serif)" },
    { value: "Cormorant Garamond", label: "Cormorant Garamond (Refined)" },
    { value: "Great Vibes", label: "Great Vibes (Romantic)" },
    { value: "Cinzel", label: "Cinzel (Modern Formal)" },
    { value: "Inter", label: "Inter (Clean Sans-serif)" },
  ];

  const fontSizeOptions = [
    { value: "4xl", label: "Small" },
    { value: "5xl", label: "Medium" },
    { value: "6xl", label: "Large" },
    { value: "7xl", label: "Extra Large" },
  ];

  return (
    <div className="relative">
      {/* Edit Controls */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-white/90 text-primary hover:bg-white shadow-lg"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        ) : (
          <>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary text-white shadow-lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="bg-white shadow-lg"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </>
        )}
      </div>

      {/* Edit Panel */}
      {isEditing && (
        <div className="fixed left-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-40 overflow-y-auto">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="w-full rounded-none border-b sticky top-0 bg-white z-10">
              <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
              <TabsTrigger value="colors" className="flex-1">
                <Palette className="w-4 h-4 mr-2" />
                Colors
              </TabsTrigger>
              <TabsTrigger value="fonts" className="flex-1">
                <Type className="w-4 h-4 mr-2" />
                Fonts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="p-6">
              <h3 className="text-xl font-serif font-bold text-primary mb-6">Edit Content</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">🔒 Locked Fields (Style Only)</p>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">Groom's Name</Label>
                      <p className="text-sm font-medium">{wedding?.groom_name}</p>
                    </div>
                    <div>
                      <Label className="text-xs">Bride's Name</Label>
                      <p className="text-sm font-medium">{wedding?.bride_name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      💡 You can change the style of these names in the Fonts tab
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="groom_family">Groom's Family</Label>
                  <Input
                    id="groom_family"
                    value={editData.groom_family}
                    onChange={(e) => setEditData({ ...editData, groom_family: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="bride_family">Bride's Family</Label>
                  <Input
                    id="bride_family"
                    value={editData.bride_family}
                    onChange={(e) => setEditData({ ...editData, bride_family: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="main_description">Description/Quote</Label>
                  <Textarea
                    id="main_description"
                    value={editData.main_description}
                    onChange={(e) => setEditData({ ...editData, main_description: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="colors" className="p-6">
              <h3 className="text-xl font-serif font-bold text-primary mb-6">Customize Colors</h3>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="primary-color">Primary Color (Gold)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={colors.primary}
                      onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                      className="w-20 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={colors.primary}
                      onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accent-color">Accent Color (Blush)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="accent-color"
                      type="color"
                      value={colors.accent}
                      onChange={(e) => setColors({ ...colors, accent: e.target.value })}
                      className="w-20 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={colors.accent}
                      onChange={(e) => setColors({ ...colors, accent: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="text-color">Text Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="text-color"
                      type="color"
                      value={colors.text}
                      onChange={(e) => setColors({ ...colors, text: e.target.value })}
                      className="w-20 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={colors.text}
                      onChange={(e) => setColors({ ...colors, text: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-xs text-muted-foreground">
                    ✨ Colors are applied instantly as you select them. Click "Save" to persist your changes.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="fonts" className="p-6">
              <h3 className="text-xl font-serif font-bold text-primary mb-6">Customize Typography</h3>
              
              <div className="space-y-6">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    🔒 Locked Names Style
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="locked-font">Font Family</Label>
                      <Select
                        value={lockedNameStyle.fontFamily}
                        onValueChange={(value) => setLockedNameStyle({ ...lockedNameStyle, fontFamily: value })}
                      >
                        <SelectTrigger id="locked-font">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fontOptions.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="locked-size">Font Size</Label>
                      <Select
                        value={lockedNameStyle.fontSize}
                        onValueChange={(value) => setLockedNameStyle({ ...lockedNameStyle, fontSize: value })}
                      >
                        <SelectTrigger id="locked-size">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fontSizeOptions.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div 
                      className="p-4 bg-white rounded text-center"
                      style={{ fontFamily: lockedNameStyle.fontFamily }}
                    >
                      <p className={`text-${lockedNameStyle.fontSize}`}>
                        {wedding?.groom_name} & {wedding?.bride_name}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="heading-font">Heading Font</Label>
                  <Select
                    value={fonts.heading}
                    onValueChange={(value) => setFonts({ ...fonts, heading: value })}
                  >
                    <SelectTrigger id="heading-font">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Used for section titles and family names
                  </p>
                </div>

                <div>
                  <Label htmlFor="body-font">Body Font</Label>
                  <Select
                    value={fonts.body}
                    onValueChange={(value) => setFonts({ ...fonts, body: value })}
                  >
                    <SelectTrigger id="body-font">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Used for descriptions and body text
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Content */}
      <div className={isEditing ? "ml-96" : ""}>
        {children}
      </div>
    </div>
  );
};

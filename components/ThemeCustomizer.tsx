"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { createImageManager, type ImageData } from "@/lib/imageManager";

type ThemeColors = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  success: string;
  warn: string;
  danger: string;
};

type CustomTheme = {
  id: string;
  name: string;
  colors: ThemeColors;
  images: {
    background?: ImageData;
    logo?: ImageData;
    patterns?: ImageData[];
  };
  fonts: {
    heading: string;
    body: string;
  };
  personal: {
    coupleNames: string;
    specialDate?: string;
    insideJokes: string[];
    favoriteMemories: string[];
  };
};

type ThemeCustomizerProps = {
  onThemeChange: (theme: CustomTheme) => void;
  initialTheme?: CustomTheme;
};

export default function ThemeCustomizer({ onThemeChange, initialTheme }: ThemeCustomizerProps) {
  const [theme, setTheme] = useState<CustomTheme>(
    initialTheme || {
      id: "default",
      name: "Default Theme",
      colors: {
        primary: "#4f8cff",
        secondary: "#6bbb6b",
        accent: "#f6c454",
        background: "#ffffff",
        text: "#0b0f13",
        success: "#6bbb6b",
        warn: "#f6c454",
        danger: "#f06a6a",
      },
      images: {},
      fonts: {
        heading: "Inter",
        body: "Inter",
      },
      personal: {
        coupleNames: "",
        insideJokes: [],
        favoriteMemories: [],
      },
    }
  );

  const [imageManager] = useState(() => createImageManager());
  const [activeTab, setActiveTab] = useState<"colors" | "images" | "fonts" | "personal">("colors");
  const [previewMode, setPreviewMode] = useState<"wordle" | "connections">("wordle");

  // Apply theme changes
  useEffect(() => {
    onThemeChange(theme);
  }, [theme, onThemeChange]);

  const updateColors = (colorKey: keyof ThemeColors, value: string) => {
    setTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value,
      },
    }));
  };

  const updatePersonal = (key: keyof CustomTheme["personal"], value: any) => {
    setTheme(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        [key]: value,
      },
    }));
  };

  const handleImageUpload = async (file: File, type: "background" | "logo" | "pattern") => {
    try {
      const imageData = await imageManager.uploadImage(file, type, ["theme"]);
      if (imageData) {
        setTheme(prev => ({
          ...prev,
          images: {
            ...prev.images,
            [type]: type === "pattern" ? [...(prev.images.patterns || []), imageData] : imageData,
          },
        }));
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Preview Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Live Preview</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setPreviewMode("wordle")}
              className={cn(
                "px-3 py-1 rounded-lg text-sm transition-colors",
                previewMode === "wordle"
                  ? "bg-accent text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              )}
            >
              Wordle
            </button>
            <button
              onClick={() => setPreviewMode("connections")}
              className={cn(
                "px-3 py-1 rounded-lg text-sm transition-colors",
                previewMode === "connections"
                  ? "bg-accent text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              )}
            >
              Connections
            </button>
          </div>
        </div>
        
        <div className="bg-card-light dark:bg-card-dark rounded-2xl p-6 border border-slate-200/30 dark:border-white/10">
          <ThemePreview theme={theme} mode={previewMode} />
        </div>
      </div>

      {/* Customization Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700">
          {[
            { id: "colors", label: "Colors", icon: "🎨" },
            { id: "images", label: "Images", icon: "🖼️" },
            { id: "fonts", label: "Fonts", icon: "✍️" },
            { id: "personal", label: "Personal", icon: "💕" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
                activeTab === tab.id
                  ? "text-accent border-b-2 border-accent bg-accent/5"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "colors" && (
          <ColorsTab theme={theme} onColorChange={updateColors} />
        )}
        {activeTab === "images" && (
          <ImagesTab 
            theme={theme} 
            onImageUpload={handleImageUpload}
            imageManager={imageManager}
          />
        )}
        {activeTab === "fonts" && (
          <FontsTab theme={theme} onFontChange={(fonts) => setTheme(prev => ({ ...prev, fonts }))} />
        )}
        {activeTab === "personal" && (
          <PersonalTab theme={theme} onPersonalChange={updatePersonal} />
        )}
      </motion.div>
    </div>
  );
}

// Theme Preview Component
function ThemePreview({ theme, mode }: { theme: CustomTheme; mode: "wordle" | "connections" }) {
  const previewStyle = {
    "--primary": theme.colors.primary,
    "--secondary": theme.colors.secondary,
    "--accent": theme.colors.accent,
    "--background": theme.colors.background,
    "--text": theme.colors.text,
    "--success": theme.colors.success,
    "--warn": theme.colors.warn,
    "--danger": theme.colors.danger,
  } as React.CSSProperties;

  return (
    <div className="space-y-4" style={previewStyle}>
      {mode === "wordle" ? (
        <WordlePreview theme={theme} />
      ) : (
        <ConnectionsPreview theme={theme} />
      )}
    </div>
  );
}

// Wordle Preview Component
function WordlePreview({ theme }: { theme: CustomTheme }) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="text-lg font-semibold mb-2" style={{ color: theme.colors.text }}>
          Wordle Preview
        </h4>
        <p className="text-sm opacity-70" style={{ color: theme.colors.text }}>
          {theme.personal.coupleNames || "Your Names"}
        </p>
      </div>
      
      {/* Wordle Grid Preview */}
      <div className="flex justify-center">
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-12 h-12 rounded border-2 flex items-center justify-center text-sm font-bold",
                i < 5 ? "bg-green-500 text-white border-green-500" :
                i < 10 ? "bg-yellow-500 text-white border-yellow-500" :
                "bg-slate-300 dark:bg-slate-600 border-slate-300 dark:border-slate-600"
              )}
            >
              {i < 5 ? "W" : i < 10 ? "O" : "R"}
            </div>
          ))}
        </div>
      </div>
      
      {/* Keyboard Preview */}
      <div className="flex justify-center">
        <div className="grid grid-cols-10 gap-1">
          {["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"].map((key, i) => (
            <div
              key={key}
              className={cn(
                "w-8 h-8 rounded text-xs flex items-center justify-center font-bold",
                i < 3 ? "bg-green-500 text-white" :
                i < 6 ? "bg-yellow-500 text-white" :
                "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              )}
            >
              {key}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Connections Preview Component
function ConnectionsPreview({ theme }: { theme: CustomTheme }) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="text-lg font-semibold mb-2" style={{ color: theme.colors.text }}>
          Connections Preview
        </h4>
        <p className="text-sm opacity-70" style={{ color: theme.colors.text }}>
          {theme.personal.coupleNames || "Your Names"}
        </p>
      </div>
      
      {/* Connections Grid Preview */}
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-12 rounded-lg flex items-center justify-center text-sm font-semibold",
              i < 4 ? "bg-yellow-400 text-black" :
              i < 8 ? "bg-green-500 text-white" :
              i < 12 ? "bg-blue-500 text-white" :
              "bg-purple-500 text-white"
            )}
          >
            {["LOVE", "HOPE", "DREAM", "JOY"][i % 4]}
          </div>
        ))}
      </div>
    </div>
  );
}

// Colors Tab Component
function ColorsTab({ 
  theme, 
  onColorChange 
}: { 
  theme: CustomTheme; 
  onColorChange: (key: keyof ThemeColors, value: string) => void; 
}) {
  const colorFields = [
    { key: "primary", label: "Primary", description: "Main accent color" },
    { key: "secondary", label: "Secondary", description: "Supporting color" },
    { key: "accent", label: "Accent", description: "Highlight color" },
    { key: "background", label: "Background", description: "Main background" },
    { key: "text", label: "Text", description: "Main text color" },
    { key: "success", label: "Success", description: "Success states" },
    { key: "warn", label: "Warning", description: "Warning states" },
    { key: "danger", label: "Danger", description: "Error states" },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {colorFields.map(({ key, label, description }) => (
          <div key={key} className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: theme.colors.text }}>
              {label}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme.colors[key]}
                onChange={(e) => onColorChange(key, e.target.value)}
                className="w-12 h-10 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={theme.colors[key]}
                onChange={(e) => onColorChange(key, e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm font-mono"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
          </div>
        ))}
      </div>
      
      {/* Preset Themes */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold" style={{ color: theme.colors.text }}>
          Preset Themes
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Romantic", colors: { primary: "#ff6b9d", secondary: "#c44569", accent: "#f8b500" } },
            { name: "Ocean", colors: { primary: "#4ecdc4", secondary: "#44a08d", accent: "#f7b731" } },
            { name: "Sunset", colors: { primary: "#ff9a9e", secondary: "#fecfef", accent: "#fecfef" } },
            { name: "Forest", colors: { primary: "#56ab2f", secondary: "#a8e6cf", accent: "#ffd3a5" } },
          ].map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                Object.entries(preset.colors).forEach(([key, value]) => {
                  onColorChange(key as keyof ThemeColors, value);
                });
              }}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-accent transition-colors"
            >
              <div className="flex gap-1 mb-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.colors.primary }}></div>
                <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.colors.secondary }}></div>
                <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.colors.accent }}></div>
              </div>
              <div className="text-sm font-medium">{preset.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Images Tab Component
function ImagesTab({ 
  theme, 
  onImageUpload,
  imageManager 
}: { 
  theme: CustomTheme; 
  onImageUpload: (file: File, type: "background" | "logo" | "pattern") => void;
  imageManager: any;
}) {
  const [dragOver, setDragOver] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent, type: "background" | "logo" | "pattern") => {
    e.preventDefault();
    setDragOver(null);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith("image/"));
    
    if (imageFile) {
      onImageUpload(imageFile, type);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "background" | "logo" | "pattern") => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file, type);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Background Image */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Background Image</h4>
          <div
            className={cn(
              "h-32 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors",
              dragOver === "background" ? "border-accent bg-accent/5" : "border-slate-300 dark:border-slate-600"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver("background");
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => handleDrop(e, "background")}
          >
            {theme.images.background ? (
              <div className="text-center">
                <img 
                  src={theme.images.background.url} 
                  alt="Background" 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ) : (
              <div className="text-center text-slate-500">
                <div className="text-2xl mb-2">🖼️</div>
                <div className="text-sm">Drop image here or click to upload</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, "background")}
                  className="hidden"
                  id="background-upload"
                />
                <label htmlFor="background-upload" className="cursor-pointer">
                  <div className="mt-2 px-4 py-2 bg-accent text-white rounded-lg text-sm">
                    Choose File
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Logo Image */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Logo Image</h4>
          <div
            className={cn(
              "h-32 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors",
              dragOver === "logo" ? "border-accent bg-accent/5" : "border-slate-300 dark:border-slate-600"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver("logo");
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => handleDrop(e, "logo")}
          >
            {theme.images.logo ? (
              <div className="text-center">
                <img 
                  src={theme.images.logo.url} 
                  alt="Logo" 
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="text-center text-slate-500">
                <div className="text-2xl mb-2">🏷️</div>
                <div className="text-sm">Drop logo here or click to upload</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, "logo")}
                  className="hidden"
                  id="logo-upload"
                />
                <label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="mt-2 px-4 py-2 bg-accent text-white rounded-lg text-sm">
                    Choose File
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Fonts Tab Component
function FontsTab({ 
  theme, 
  onFontChange 
}: { 
  theme: CustomTheme; 
  onFontChange: (fonts: CustomTheme["fonts"]) => void; 
}) {
  const fontOptions = [
    "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", 
    "Nunito", "Source Sans Pro", "Raleway", "Ubuntu", "Playfair Display", "Merriweather"
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Heading Font</h4>
          <select
            value={theme.fonts.heading}
            onChange={(e) => onFontChange({ ...theme.fonts, heading: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
            style={{ fontFamily: theme.fonts.heading }}
          >
            {fontOptions.map(font => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
          <div 
            className="text-2xl font-bold p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
            style={{ fontFamily: theme.fonts.heading }}
          >
            Sample Heading Text
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Body Font</h4>
          <select
            value={theme.fonts.body}
            onChange={(e) => onFontChange({ ...theme.fonts, body: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
            style={{ fontFamily: theme.fonts.body }}
          >
            {fontOptions.map(font => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
          <div 
            className="text-sm p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
            style={{ fontFamily: theme.fonts.body }}
          >
            This is sample body text to preview how your chosen font will look in the games.
          </div>
        </div>
      </div>
    </div>
  );
}

// Personal Tab Component
function PersonalTab({ 
  theme, 
  onPersonalChange 
}: { 
  theme: CustomTheme; 
  onPersonalChange: (key: keyof CustomTheme["personal"], value: any) => void; 
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Couple Names</h4>
          <input
            type="text"
            value={theme.personal.coupleNames}
            onChange={(e) => onPersonalChange("coupleNames", e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
            placeholder="Jessie & [Your Name]"
          />
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Special Date</h4>
          <input
            type="date"
            value={theme.personal.specialDate || ""}
            onChange={(e) => onPersonalChange("specialDate", e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Inside Jokes</h4>
        <textarea
          value={theme.personal.insideJokes.join(", ")}
          onChange={(e) => onPersonalChange("insideJokes", e.target.value.split(", ").filter(Boolean))}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
          placeholder="Enter inside jokes separated by commas"
          rows={3}
        />
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Favorite Memories</h4>
        <textarea
          value={theme.personal.favoriteMemories.join(", ")}
          onChange={(e) => onPersonalChange("favoriteMemories", e.target.value.split(", ").filter(Boolean))}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
          placeholder="Enter favorite memories separated by commas"
          rows={3}
        />
      </div>
    </div>
  );
}

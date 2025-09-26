export type ImageData = {
  id: string;
  name: string;
  url: string;
  type: "background" | "logo" | "pattern" | "memory" | "custom";
  size: number;
  uploadedAt: string;
  tags: string[];
  personal: {
    description?: string;
    memory?: string;
    associatedWords?: string[];
  };
};

export class ImageManager {
  private images: ImageData[] = [];
  private maxFileSize = 5 * 1024 * 1024; // 5MB
  private allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  constructor() {
    this.loadImages();
  }

  // Load images from localStorage
  private loadImages(): void {
    const saved = localStorage.getItem("personalImages");
    if (saved) {
      this.images = JSON.parse(saved);
    }
  }

  // Save images to localStorage
  private saveImages(): void {
    localStorage.setItem("personalImages", JSON.stringify(this.images));
  }

  // Upload a new image
  async uploadImage(
    file: File,
    type: ImageData["type"],
    tags: string[] = [],
    personal?: ImageData["personal"]
  ): Promise<ImageData | null> {
    // Validate file
    if (!this.validateFile(file)) {
      throw new Error("Invalid file type or size");
    }

    try {
      // Convert to base64 for storage
      const base64 = await this.fileToBase64(file);
      
      const imageData: ImageData = {
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        url: base64,
        type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        tags,
        personal: personal || {},
      };

      this.images.push(imageData);
      this.saveImages();
      
      return imageData;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  }

  // Get images by type
  getImagesByType(type: ImageData["type"]): ImageData[] {
    return this.images.filter(img => img.type === type);
  }

  // Get images by tags
  getImagesByTags(tags: string[]): ImageData[] {
    return this.images.filter(img => 
      tags.some(tag => img.tags.includes(tag))
    );
  }

  // Get all images
  getAllImages(): ImageData[] {
    return [...this.images];
  }

  // Delete an image
  deleteImage(id: string): boolean {
    const index = this.images.findIndex(img => img.id === id);
    if (index !== -1) {
      this.images.splice(index, 1);
      this.saveImages();
      return true;
    }
    return false;
  }

  // Update image metadata
  updateImage(id: string, updates: Partial<ImageData>): boolean {
    const index = this.images.findIndex(img => img.id === id);
    if (index !== -1) {
      this.images[index] = { ...this.images[index], ...updates };
      this.saveImages();
      return true;
    }
    return false;
  }

  // Get image by ID
  getImageById(id: string): ImageData | null {
    return this.images.find(img => img.id === id) || null;
  }

  // Search images
  searchImages(query: string): ImageData[] {
    const lowercaseQuery = query.toLowerCase();
    return this.images.filter(img => 
      img.name.toLowerCase().includes(lowercaseQuery) ||
      img.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      img.personal.description?.toLowerCase().includes(lowercaseQuery) ||
      img.personal.memory?.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get storage usage
  getStorageUsage(): { used: number; total: number; percentage: number } {
    const used = this.images.reduce((sum, img) => sum + img.size, 0);
    const total = 10 * 1024 * 1024; // 10MB limit
    const percentage = (used / total) * 100;
    
    return { used, total, percentage };
  }

  // Validate file
  private validateFile(file: File): boolean {
    if (!this.allowedTypes.includes(file.type)) {
      return false;
    }
    
    if (file.size > this.maxFileSize) {
      return false;
    }
    
    return true;
  }

  // Convert file to base64
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Export images as JSON
  exportImages(): string {
    return JSON.stringify(this.images, null, 2);
  }

  // Import images from JSON
  importImages(jsonData: string): boolean {
    try {
      const importedImages = JSON.parse(jsonData);
      if (Array.isArray(importedImages)) {
        this.images = [...this.images, ...importedImages];
        this.saveImages();
        return true;
      }
    } catch (error) {
      console.error("Error importing images:", error);
    }
    return false;
  }

  // Clear all images
  clearAllImages(): void {
    this.images = [];
    this.saveImages();
  }
}

// Utility function to create an image manager instance
export function createImageManager(): ImageManager {
  return new ImageManager();
}

// Predefined image categories and suggestions
export const IMAGE_CATEGORIES = {
  backgrounds: [
    "sunset", "beach", "mountains", "city", "nature", "abstract", "gradient"
  ],
  logos: [
    "couple", "heart", "star", "flower", "geometric", "minimalist"
  ],
  patterns: [
    "dots", "lines", "hearts", "stars", "geometric", "organic"
  ],
  memories: [
    "date", "vacation", "celebration", "everyday", "special", "anniversary"
  ],
  custom: [
    "personal", "art", "photo", "drawing", "design"
  ]
};

// Image upload component props
export type ImageUploadProps = {
  onUpload: (image: ImageData) => void;
  type: ImageData["type"];
  maxSize?: number;
  accept?: string;
  multiple?: boolean;
};

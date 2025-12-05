import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { ImageOff, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (imageUrl: string) => void;
}

interface StorageImage {
  name: string;
  url: string;
}

export function ImageLibraryDialog({ open, onOpenChange, onSelect }: ImageLibraryDialogProps) {
  const [images, setImages] = useState<StorageImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('sample-images')
        .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

      if (error) throw error;

      const imageFiles = data?.filter(file => file.name !== '.emptyFolderPlaceholder') || [];
      
      const imageUrls = imageFiles.map(file => ({
        name: file.name,
        url: supabase.storage.from('sample-images').getPublicUrl(file.name).data.publicUrl
      }));

      setImages(imageUrls);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchImages();
    }
  }, [open, fetchImages]);

  const handleSelect = (imageUrl: string) => {
    onSelect(imageUrl);
    onOpenChange(false);
  };

  const sanitizeFileName = (name: string): string => {
    // Get file extension
    const ext = name.split('.').pop() || 'jpg';
    // Remove extension, sanitize, then add back
    const baseName = name.replace(/\.[^/.]+$/, '');
    // Replace special chars with underscore, keep only alphanumeric and basic chars
    const sanitized = baseName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-zA-Z0-9]/g, '_') // Replace non-alphanumeric with underscore
      .replace(/_+/g, '_') // Collapse multiple underscores
      .replace(/^_|_$/g, '') // Remove leading/trailing underscores
      .substring(0, 50); // Limit length
    return `${sanitized}.${ext}`;
  };

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    setUploading(true);
    try {
      const sanitizedName = sanitizeFileName(file.name);
      const fileName = `${Date.now()}-${sanitizedName}`;
      const { error } = await supabase.storage
        .from('sample-images')
        .upload(fileName, file);

      if (error) throw error;
      
      await fetchImages();
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => uploadFile(file));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => uploadFile(file));
  };

  const handleDelete = async (fileName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase.storage
        .from('sample-images')
        .remove([fileName]);

      if (error) throw error;
      await fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Thư viện ảnh</DialogTitle>
        </DialogHeader>
        
        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Đang tải lên...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Kéo thả ảnh vào đây hoặc click để chọn
                </p>
              </div>
            )}
          </label>
        </div>

        {/* Images grid */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <ImageOff className="w-12 h-12 mb-3" />
            <p className="text-sm">Chưa có ảnh nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {images.map((image) => (
              <button
                key={image.name}
                onClick={() => handleSelect(image.url)}
                className="relative group rounded-xl overflow-hidden aspect-square border-2 border-transparent hover:border-primary transition-all duration-200"
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleDelete(image.name, e)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

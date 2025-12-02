import React, { useCallback } from 'react';
import { Upload, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  image: string | null;
  onImageChange: (image: string | null) => void;
  label: string;
  hint?: string;
  required?: boolean;
  showAnonymousOption?: boolean;
  onAnonymousSelect?: () => void;
}

export function ImageUploader({
  image,
  onImageChange,
  label,
  hint,
  required = false,
  showAnonymousOption = false,
  onAnonymousSelect
}: ImageUploaderProps) {
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageChange]);

  const handleRemove = useCallback(() => {
    onImageChange(null);
  }, [onImageChange]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
        {showAnonymousOption && !image && (
          <button
            type="button"
            onClick={onAnonymousSelect}
            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            <User className="w-3 h-3" />
            Ẩn danh
          </button>
        )}
      </div>
      
      {image ? (
        <div className="relative group animate-scale-in">
          <img
            src={image}
            alt={label}
            className="w-full h-48 object-cover rounded-2xl border border-border"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-3 right-3 p-2 bg-card/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive hover:text-destructive-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label
          className={cn(
            "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200",
            "border-border hover:border-primary hover:bg-accent-blue/30"
          )}
        >
          <div className="flex flex-col items-center justify-center py-6">
            <div className="p-3 bg-accent-blue rounded-full mb-3">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Nhấn để tải ảnh lên
            </p>
            {hint && (
              <p className="text-xs text-muted-foreground/70 mt-1">
                {hint}
              </p>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  );
}

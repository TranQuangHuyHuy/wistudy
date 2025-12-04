import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { sampleImages } from '@/data/sampleImages';
import { ImageOff } from 'lucide-react';

interface ImageLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (imageUrl: string) => void;
}

export function ImageLibraryDialog({ open, onOpenChange, onSelect }: ImageLibraryDialogProps) {
  const handleSelect = (imageUrl: string) => {
    onSelect(imageUrl);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Thư viện ảnh</DialogTitle>
        </DialogHeader>
        
        {sampleImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <ImageOff className="w-12 h-12 mb-3" />
            <p className="text-sm">Chưa có ảnh mẫu nào</p>
            <p className="text-xs mt-1">Thêm ảnh vào src/data/sampleImages.ts</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {sampleImages.map((image) => (
              <button
                key={image.id}
                onClick={() => handleSelect(image.preview)}
                className="relative group rounded-xl overflow-hidden aspect-square border-2 border-transparent hover:border-primary transition-all duration-200"
              >
                <img
                  src={image.preview}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="absolute bottom-2 left-2 right-2 text-primary-foreground text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity truncate">
                  {image.name}
                </p>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

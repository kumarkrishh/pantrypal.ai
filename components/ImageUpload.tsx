'use client';

import React, { useCallback } from 'react';
import Image from 'next/image';
import { Upload, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  imagePreview: string | null;
  isRecipeGenerated: boolean;
  isImageProcessing: boolean;
  error: string | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: () => void;
}

export function ImageUpload({
  imagePreview,
  isRecipeGenerated,
  isImageProcessing,
  error,
  onImageUpload,
  onImageRemove
}: ImageUploadProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const event = {
        target: {
          files: files
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onImageUpload(event);
    }
  }, [onImageUpload]);

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "rounded-xl border-2 border-dashed p-8 transition-all bg-gradient-to-br",
          "hover:border-indigo-300 hover:from-indigo-50/30 hover:to-purple-50/30",
          isRecipeGenerated ? "border-gray-200 from-gray-50 to-gray-50/50" : "border-indigo-200 from-white to-white"
        )}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {!isRecipeGenerated ? (
          <div className="flex flex-col items-center space-y-6">
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                {isImageProcessing ? (
                  <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                ) : (
                  <Upload className="h-8 w-8 text-indigo-600" />
                )}
              </div>
              <span className="text-base font-medium text-gray-700">
                {imagePreview ? 'Change Image' : 'Upload Ingredient Image'}
              </span>
              <span className="text-sm text-gray-500 mt-1">Drag and drop or click to upload</span>
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              disabled={isRecipeGenerated || isImageProcessing}
              className="hidden"
            />

            {imagePreview && (
              <div className="relative w-full max-w-xs aspect-video rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={imagePreview}
                  alt="Uploaded ingredients"
                  fill
                  className="object-cover"
                />
                <button
                  onClick={onImageRemove}
                  className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-red-500 transition-colors duration-200"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          imagePreview && (
            <div className="relative rounded-xl overflow-hidden shadow-lg transition-all w-64 h-64 mx-auto mt-4">
              <Image
                src={imagePreview}
                alt="Uploaded ingredients"
                fill
                className="object-cover"
              />
              <button
                onClick={onImageRemove}
                className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-red-500 transition-colors duration-200"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          )
        )}
      </div>
      {error && (
        <Alert variant="destructive" className="mt-2">
          {error}
        </Alert>
      )}
    </div>
  );
}
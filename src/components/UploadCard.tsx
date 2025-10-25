import { useState, useRef, DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface UploadCardProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
  onClear: () => void;
}

export const UploadCard = ({ onImageSelect, selectedImage, onClear }: UploadCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      onImageSelect(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
    setPreview(null);
    onClear();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="backdrop-blur-xl bg-white/30 dark:bg-white/5 rounded-3xl border border-white/20 dark:border-white/10 p-8 shadow-2xl">
        <AnimatePresence mode="wait">
          {!preview ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragging
                  ? 'border-light-accent dark:border-dark-accent bg-light-accent/10 dark:bg-dark-accent/10'
                  : 'border-light-text/20 dark:border-dark-text/20 hover:border-light-accent/50 dark:hover:border-dark-accent/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                aria-label="Upload retinal image"
              />

              <motion.div
                animate={{ scale: isDragging ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <Upload className="w-16 h-16 mx-auto mb-4 text-light-accent dark:text-dark-accent" />
              </motion.div>

              <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">
                Upload Retinal Fundus Image
              </h3>
              <p className="text-sm text-light-text/60 dark:text-dark-text/60 mb-4">
                Drag and drop or click to select
              </p>
              <p className="text-xs text-light-text/40 dark:text-dark-text/40">
                Supports: JPG, PNG, JPEG
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative"
            >
              <button
                onClick={handleClear}
                className="absolute -top-3 -right-3 z-10 p-2 rounded-full backdrop-blur-xl bg-white/80 dark:bg-white/20 hover:bg-white/90 dark:hover:bg-white/30 transition-all duration-300 shadow-lg border border-white/30"
                aria-label="Clear image"
              >
                <X className="w-5 h-5 text-light-text dark:text-dark-text" />
              </button>

              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={preview}
                  alt="Selected retinal fundus"
                  className="w-full h-auto max-h-96 object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>

              <div className="mt-4 flex items-center gap-3 text-sm text-light-text dark:text-dark-text">
                <ImageIcon className="w-5 h-5 text-light-accent dark:text-dark-accent" />
                <span className="font-medium truncate">{selectedImage?.name}</span>
                <span className="text-light-text/50 dark:text-dark-text/50">
                  ({((selectedImage?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

import React, { useState, useCallback } from 'react';
import { Upload, FileCheck, Lock, X } from 'lucide-react';

interface UploadProps {
  label: string;
  onUpload: (file: File) => void;
  microcopy?: string;
  trustMessage?: string;
  acceptedFormats?: string;
}

export function FileUpload({ 
  label, 
  onUpload, 
  microcopy, 
  trustMessage = 'Daten werden lokal verarbeitet',
  acceptedFormats = '.pdf'
}: UploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setUploadedFile(files[0]);
      onUpload(files[0]);
    }
  }, [onUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setUploadedFile(files[0]);
      onUpload(files[0]);
    }
  }, [onUpload]);

  const handleRemove = useCallback(() => {
    setUploadedFile(null);
  }, []);

  return (
    <div className="space-y-2">
      <label className="text-sm text-foreground">{label}</label>
      
      {!uploadedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border bg-muted/30'
          }`}
        >
          <input
            type="file"
            accept={acceptedFormats}
            onChange={handleFileInput}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="mb-1 text-sm text-foreground">
            Datei hierher ziehen oder <span className="text-primary">klicken zum Hochladen</span>
          </p>
          {microcopy && (
            <p className="mb-2 text-xs text-muted-foreground">{microcopy}</p>
          )}
          <div className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>{trustMessage}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/5 p-4">
          <FileCheck className="h-5 w-5 text-success" />
          <div className="flex-1">
            <p className="text-sm text-foreground">{uploadedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(uploadedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            onClick={handleRemove}
            className="rounded-full p-1 hover:bg-muted"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}

interface ExtractedDataChipProps {
  label: string;
  value: string;
}

export function ExtractedDataChip({ label, value }: ExtractedDataChipProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1">
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className="text-xs text-foreground">{value}</span>
    </div>
  );
}

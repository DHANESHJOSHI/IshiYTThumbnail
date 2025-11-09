
import React, { useState, useCallback, useRef } from 'react';
import { MAX_UPLOAD_SIZE_MB } from '../constants';

interface ImageUploaderProps {
  onImagesSelected: (files: File[]) => void;
  selectedFiles: File[];
  clearFiles: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesSelected, selectedFiles, clearFiles }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const processFiles = useCallback((files: FileList) => {
    const validFiles: File[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/') && file.size <= MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
        validFiles.push(file);
      } else {
        alert(
          `File ${file.name} is not a valid image or exceeds the ${MAX_UPLOAD_SIZE_MB}MB limit.`
        );
      }
    });
    onImagesSelected(validFiles);
  }, [onImagesSelected]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
        e.dataTransfer.clearData();
      }
    },
    [processFiles]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
      }
    },
    [processFiles]
  );

  const handleClear = useCallback(() => {
    clearFiles();
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
    }
  }, [clearFiles]);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Upload Images (Optional)
      </label>
      <div
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors duration-200
          ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
          id="file-upload"
        />
        <p className="text-gray-600 mb-2">Drag & drop your images here, or</p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          Browse Files
        </button>
        <p className="text-xs text-gray-500 mt-2">Max {MAX_UPLOAD_SIZE_MB}MB per image, JPG, PNG, GIF, BMP, WebP supported.</p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <p className="font-medium text-gray-700 mb-2">Selected Files:</p>
          <ul className="list-disc pl-5 text-sm text-gray-600">
            {selectedFiles.map((file, index) => (
              <li key={index} className="truncate">
                {file.name} ({Math.round(file.size / 1024)} KB)
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={handleClear}
            className="mt-3 px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

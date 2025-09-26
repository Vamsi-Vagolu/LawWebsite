"use client";

import { useState, useRef, ChangeEvent } from "react";

interface MultiFileUploadProps {
  files: { file: File; title: string }[];
  setFiles: (files: { file: File; title: string }[]) => void;
  category: string;
}

const MultiFileUpload = ({ files, setFiles, category }: MultiFileUploadProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_FILE_SIZE_MB = 10;

  const validateFile = (file: File): string | null => {
    if (file.type !== "application/pdf") {
      return "Only PDF files are allowed";
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${MAX_FILE_SIZE_MB}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
    }

    if (file.size === 0) {
      return "File appears to be empty";
    }

    if (file.name.length > 255) {
      return "Filename is too long (max 255 characters)";
    }

    return null;
  };

  const sanitizeFileName = (file: File) => {
    const sanitized = file.name
      .replace(/\s+/g, "_")
      .replace(/[^\w.-]/g, "")
      .toLowerCase();

    return new File([file], sanitized, { type: file.type });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
  };

  const processFiles = (newFiles: File[]) => {
    setError("");
    const validFiles: { file: File; title: string }[] = [];
    const errors: string[] = [];

    newFiles.forEach((file) => {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
      } else {
        const sanitizedFile = sanitizeFileName(file);
        const title = file.name.replace('.pdf', '').replace(/[_-]/g, ' ').trim();
        validFiles.push({ file: sanitizedFile, title });
      }
    });

    if (errors.length > 0) {
      setError(errors.join('; '));
    }

    if (validFiles.length > 0) {
      setFiles([...files, ...validFiles]);
    }

    if (inputRef.current) inputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const updateTitle = (index: number, title: string) => {
    const updatedFiles = [...files];
    updatedFiles[index].title = title;
    setFiles(updatedFiles);
  };

  const clearAllFiles = () => {
    setFiles([]);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-between items-center">
        <label className="text-gray-800 font-semibold text-lg">
          Upload Multiple PDF Files for {category}
          <span className="text-sm font-normal text-gray-500 ml-2">
            (Max {MAX_FILE_SIZE_MB}MB each)
          </span>
        </label>
        {files.length > 0 && (
          <button
            type="button"
            onClick={clearAllFiles}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
          >
            Clear All ({files.length})
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      <div
        className={`
          border-2 border-dashed rounded-xl cursor-pointer text-center
          transition-all duration-200 flex flex-col items-center justify-center
          w-full p-8 min-h-[150px]
          ${dragOver
            ? "border-blue-500 bg-blue-50 scale-[1.02]"
            : error
            ? "border-red-300 bg-red-50"
            : "border-gray-300 hover:border-gray-400"
          }
        `}
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-gray-700 text-lg font-medium">
              Click to select multiple PDF files
            </p>
            <p className="text-gray-500 text-sm mt-1">
              or drag & drop them here
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Maximum file size: {MAX_FILE_SIZE_MB}MB per file
            </p>
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {files.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">
            Selected Files ({files.length})
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {files.map((fileData, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border border-gray-200 flex items-center gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-grow min-w-0">
                  <input
                    type="text"
                    value={fileData.title}
                    onChange={(e) => updateTitle(index, e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-medium"
                    placeholder="Enter title for this bare act"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {fileData.file.name} • {formatFileSize(fileData.file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0 p-1 text-red-500 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiFileUpload;
"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";

interface FileUploadProps {
  file: File | null;
  setFile: (file: File | null) => void;
}

const FileUpload = ({ file, setFile }: FileUploadProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  // File size limit (10MB) - matches backend validation
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  const MAX_FILE_SIZE_MB = 10;

  // Detect if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Enhanced file validation
  const validateFile = (file: File): string | null => {
    // Reset error
    setError("");

    // Check file type
    if (file.type !== "application/pdf") {
      return "Only PDF files are allowed";
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${MAX_FILE_SIZE_MB}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
    }

    // Check if file is not empty
    if (file.size === 0) {
      return "File appears to be empty";
    }

    // File name validation
    if (file.name.length > 255) {
      return "Filename is too long (max 255 characters)";
    }

    return null; // No errors
  };

  // Sanitize filename: replace spaces with _ and remove unsafe chars
  const sanitizeFileName = (file: File) => {
    const sanitized = file.name
      .replace(/\s+/g, "_") // replace spaces with underscores
      .replace(/[^\w.-]/g, "") // remove unsafe characters
      .toLowerCase(); // convert to lowercase for consistency

    return new File([file], sanitized, { type: file.type });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (isMobile) return;
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    if (isMobile) return;
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (isMobile) return;
    e.preventDefault();
    setDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (file: File) => {
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      // Clear the input
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    // File is valid, sanitize and set
    setFile(sanitizeFileName(file));
    setError(""); // Clear any previous errors
  };

  const removeFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setFile(null);
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
    <div className="flex flex-col gap-3 w-full">
      <label className="text-gray-800 font-semibold text-lg">
        PDF File
        <span className="text-sm font-normal text-gray-500 ml-2">
          (Max {MAX_FILE_SIZE_MB}MB)
        </span>
      </label>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      <div
        className={`
          border-2 border-dashed rounded-xl cursor-pointer text-center 
          transition-all duration-200 flex flex-col items-center justify-center 
          w-full p-8 min-h-[200px]
          ${
            dragOver
              ? "border-blue-500 bg-blue-50 scale-[1.02]"
              : error
              ? "border-red-300 bg-red-50"
              : "border-gray-300 hover:border-gray-400"
          }
        `}
        onClick={() => inputRef.current?.click()}
        onDragOver={!isMobile ? handleDragOver : undefined}
        onDragLeave={!isMobile ? handleDragLeave : undefined}
        onDrop={!isMobile ? handleDrop : undefined}
      >
        {file ? (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="w-full max-w-sm">
              <iframe
                src={URL.createObjectURL(file)}
                className="border-2 border-gray-200 rounded-lg w-full h-48 shadow-sm"
                title={file.name}
              />
            </div>

            {/* File Info */}
            <div className="text-center space-y-2">
              <p className="text-gray-700 text-base font-medium break-all px-2">
                {file.name}
              </p>
              <p className="text-gray-500 text-sm">
                {formatFileSize(file.size)}
              </p>
              <div className="flex items-center justify-center gap-2 text-green-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">Valid PDF file</span>
              </div>
            </div>

            <button
              type="button"
              onClick={removeFile}
              className="w-full max-w-xs px-6 py-3 bg-red-500 hover:bg-red-600 
                         text-white rounded-lg text-base font-medium transition-colors"
            >
              Remove File
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-gray-700 text-lg font-medium">
                Tap to select a PDF file
              </p>
              {!isMobile && (
                <p className="text-gray-500 text-sm mt-1">
                  or drag & drop it here
                </p>
              )}
              <p className="text-gray-400 text-xs mt-2">
                Maximum file size: {MAX_FILE_SIZE_MB}MB
              </p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default FileUpload;

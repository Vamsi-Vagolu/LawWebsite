"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";

interface FileUploadProps {
  file: File | null;
  setFile: (file: File | null) => void;
}

const FileUpload = ({ file, setFile }: FileUploadProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Sanitize filename: replace spaces with _ and remove unsafe chars
  const sanitizeFileName = (file: File) => {
    const sanitized = file.name
      .replace(/\s+/g, "_") // replace spaces
      .replace(/[^\w.-]/g, ""); // remove unsafe chars
    return new File([file], sanitized, { type: file.type });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (isMobile) return; // Disable drag on mobile
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    if (isMobile) return; // Disable drag on mobile
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (isMobile) return; // Disable drag on mobile
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(sanitizeFileName(droppedFile));
    } else {
      alert("Please drop a PDF file.");
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(sanitizeFileName(selectedFile));
    } else {
      alert("Please select a PDF file.");
    }
  };

  const removeFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <label className="text-gray-800 font-semibold text-lg">PDF File</label>

      <div
        className={`
          border-2 border-dashed rounded-xl cursor-pointer text-center 
          transition-all duration-200 flex flex-col items-center justify-center 
          w-full p-8 min-h-[200px]
          ${
            dragOver
              ? "border-blue-500 bg-blue-50 scale-[1.02]"
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
            <p className="text-gray-700 text-base font-medium break-all px-2">
              {file.name}
            </p>
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

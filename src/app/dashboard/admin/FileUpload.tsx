"use client";

import { useState, useRef, ChangeEvent } from "react";

interface FileUploadProps {
  file: File | null;
  setFile: (file: File | null) => void;
}

export const FileUpload = ({ file, setFile }: FileUploadProps) => {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
    } else {
      alert("Please drop a PDF file.");
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      alert("Please select a PDF file.");
    }
  };

  // **Fixed remove behavior:** only clears the file, no file selector triggered
  const removeFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // prevent click on container
    setFile(null);
    if (inputRef.current) inputRef.current.value = ""; // clear input
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-gray-700 font-semibold">PDF File</label>

      <div
        className={`border-2 border-dashed p-4 rounded cursor-pointer text-center transition-colors ${
          dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="flex flex-col items-center gap-2">
            {/* PDF Preview */}
            <iframe
              src={URL.createObjectURL(file)}
              width="200"
              height="250"
              className="border"
            />
            <p className="text-gray-800">{file.name}</p>
            <button
              type="button"
              onClick={removeFile}
              className="px-2 py-1 bg-red-500 text-white rounded text-sm"
            >
              Remove
            </button>
          </div>
        ) : (
          <p className="text-gray-500">
            Drag & drop a PDF here, or click to select
          </p>
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

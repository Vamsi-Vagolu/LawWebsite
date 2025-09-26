"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "white" | "blue" | "gray" | "green" | "red";
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = "md",
  color = "blue",
  text,
  fullScreen = false
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  const colorClasses = {
    white: "border-white border-t-transparent",
    blue: "border-blue-600 border-t-transparent",
    gray: "border-gray-600 border-t-transparent",
    green: "border-green-600 border-t-transparent",
    red: "border-red-600 border-t-transparent"
  };

  const textColorClasses = {
    white: "text-white",
    blue: "text-blue-600",
    gray: "text-gray-600",
    green: "text-green-600",
    red: "text-red-600"
  };

  const spinner = (
    <div className="flex items-center justify-center gap-3">
      <div
        className={`animate-spin rounded-full border-2 ${sizeClasses[size]} ${colorClasses[color]}`}
      />
      {text && (
        <span className={`text-sm font-medium ${textColorClasses[color]}`}>
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-xl">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
}

export function LoadingButton({
  loading,
  children,
  disabled,
  className,
  onClick,
  type = "button",
  ...props
}: {
  loading: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  [key: string]: unknown;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative flex items-center justify-center gap-2 transition-all duration-200 ${className} ${
        loading ? "cursor-not-allowed opacity-90" : ""
      }`}
      {...props}
    >
      {loading && (
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <LoadingSpinner size="sm" color="white" />
        </div>
      )}
      <span className={loading ? "opacity-0" : "opacity-100"}>
        {children}
      </span>
    </button>
  );
}
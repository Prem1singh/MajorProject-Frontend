import React from "react";

export function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white shadow-md rounded-xl border 
      w-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 
      ${className}`}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return (
    <div
      className={`p-3 sm:p-4 md:p-6 
      ${className}`}
    >
      {children}
    </div>
  );
}

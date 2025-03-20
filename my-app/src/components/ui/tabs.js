// src/components/ui/tabs.js
import React from "react";

export const Tabs = ({ children }) => {
  return <div className="tabs-wrapper">{children}</div>;
};

export const TabsList = ({ children }) => {
  return <div className="flex justify-center space-x-4 mb-4 bg-gray-900 p-2 rounded-xl shadow-md">{children}</div>;
};

export const TabsTrigger = ({ value, activeTab, onClick, children }) => {
  const isActive = activeTab === value;
  return (
    <button
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
        isActive ? "bg-blue-600 text-white shadow-lg" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
      }`}
      onClick={() => onClick(value)}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, activeTab, children }) => {
  if (value !== activeTab) return null;
  return <div className="mt-4 text-sm text-gray-100">{children}</div>;
};
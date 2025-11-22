import React, { useState, useEffect } from 'react';
import { APP_NAME, APP_VERSION } from '@/shared/constants';

const Popup: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load count from Chrome storage
    chrome.storage.sync.get(['count'], (result) => {
      if (result.count !== undefined) {
        setCount(result.count);
      }
      setIsLoading(false);
    });
  }, []);

  const handleIncrement = () => {
    const newCount = count + 1;
    setCount(newCount);
    
    // Save to Chrome storage
    chrome.storage.sync.set({ count: newCount });
  };

  const handleReset = () => {
    setCount(0);
    chrome.storage.sync.set({ count: 0 });
  };

  const openOptionsPage = () => {
    // Placeholder for future options page
    console.log('Options page not yet implemented');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary-800 mb-2">
            {APP_NAME}
          </h1>
          <p className="text-sm text-primary-600">v{APP_VERSION}</p>
        </div>

        {/* Counter Display */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="text-center">
            <p className="text-gray-600 text-sm font-medium mb-3 uppercase tracking-wide">
              Counter
            </p>
            <div className="text-6xl font-bold text-primary-600 mb-6">
              {count}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleIncrement}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Increment
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-primary-600 mt-0.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                Getting Started
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                This is a boilerplate Chrome extension built with React, TypeScript, 
                Tailwind CSS, and Vite. Customize it to build your own extension!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <button
            onClick={openOptionsPage}
            className="text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors duration-200"
          >
            Settings →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;


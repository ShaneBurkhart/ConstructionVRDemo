import React from 'react';

export const Spinner = ({ small }) => {
  let widthHeight = "w-10 h-10";
  if (small) widthHeight = "w-5 h-5";
  return (
    <svg className={`${widthHeight} mr-3 -ml-1 text-blue-800 animate-spin`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  )
}

export const LoadingSpinner = ({ small=false }) => {
  return (
    <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full bg-white opacity-80">
      <Spinner small={small} />
    </div>
  );
};

export const FullPageLoadingSpinner = () => (
  <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-screen h-screen">
    <LoadingSpinner />
  </div>
)

export default LoadingSpinner;

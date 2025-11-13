
import React, { useState, useEffect, useRef } from 'react';

interface ImageDisplayProps {
  imageFile: File | null;
  onLoad: () => void;
  onError: () => void;
  transition: string;
}

const transitions: { [key: string]: string } = {
  'fade-in': 'fadeIn 1s ease-in-out',
  'zoom-in': 'zoomIn 1.2s ease-out',
  'slide-left': 'slideLeft 1.2s cubic-bezier(0.25, 1, 0.5, 1)',
  'slide-right': 'slideRight 1.2s cubic-bezier(0.25, 1, 0.5, 1)',
};

const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageFile, onLoad, onError, transition }) => {
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const [key, setKey] = useState(0);
  const [currentTransition, setCurrentTransition] = useState(transition);
  
  // This ref holds the URL that is currently visible so we can revoke it later.
  const activeUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!imageFile) {
      if(activeUrlRef.current) {
        URL.revokeObjectURL(activeUrlRef.current);
        activeUrlRef.current = null;
      }
      setDisplayUrl(null);
      return;
    }

    const newUrl = URL.createObjectURL(imageFile);
    const img = new Image();
    img.src = newUrl;

    img.onload = () => {
      // The new image is loaded, so we can now revoke the old URL.
      if (activeUrlRef.current) {
        URL.revokeObjectURL(activeUrlRef.current);
      }
      // The new URL becomes the active one.
      activeUrlRef.current = newUrl;
      
      // Update state to render the new image and trigger the animation.
      setDisplayUrl(newUrl);
      setCurrentTransition(transition);
      setKey(k => k + 1);
      onLoad();
    };

    img.onerror = () => {
      URL.revokeObjectURL(newUrl); // clean up failed load
      onError();
    };

  }, [imageFile, onLoad, onError, transition]);

  // Cleanup on component unmount.
  useEffect(() => {
    return () => {
      if (activeUrlRef.current) {
        URL.revokeObjectURL(activeUrlRef.current);
      }
    };
  }, []);

  if (!displayUrl) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <img
        key={key} // Force re-render for animation
        src={displayUrl}
        alt={imageFile?.name || 'Slideshow image'}
        className="max-w-full max-h-full object-contain"
        style={{
          animation: transitions[currentTransition] || transitions['fade-in'],
        }}
      />
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.99); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes zoomIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes slideLeft {
            from { opacity: 0; transform: translateX(5%); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideRight {
            from { opacity: 0; transform: translateX(-5%); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}
      </style>
    </div>
  );
};

export default ImageDisplay;

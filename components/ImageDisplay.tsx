import React, { useState, useEffect } from 'react';

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

interface AnimationConfig {
  keyframe: string;
  name: string;
}

// Helper to generate a random Ken Burns effect
const generateKenBurns = (): AnimationConfig => {
    const name = `kenburns-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    const scale = 1.1 + Math.random() * 0.1; // Zoom from 110% to 120%
    
    const endX = Math.random() * 10 - 5; // Pan between -5% to 5%
    const endY = Math.random() * 10 - 5;

    const keyframe = `
      @keyframes ${name} {
        0% { transform: scale(1) translate(0, 0); }
        100% { transform: scale(${scale}) translate(${endX}%, ${endY}%); }
      }
    `;
    return { keyframe, name };
};


const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageFile, onLoad, onError, transition }) => {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [previousUrl, setPreviousUrl] = useState<string | null>(null);
  const [kenBurnsAnim, setKenBurnsAnim] = useState<AnimationConfig | null>(null);

  // Effect to create URLs, handle image loading, and generate animations
  useEffect(() => {
    // If there's no file, clean up everything and return.
    if (!imageFile) {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      if (previousUrl) URL.revokeObjectURL(previousUrl);
      setCurrentUrl(null);
      setPreviousUrl(null);
      setKenBurnsAnim(null);
      return;
    }

    let isStale = false;
    const newUrl = URL.createObjectURL(imageFile);
    const img = new Image();
    img.src = newUrl;

    img.onload = () => {
      // If a new image was selected before this one finished loading,
      // don't update the state, just clean up the URL to prevent a memory leak.
      if (isStale) {
        URL.revokeObjectURL(newUrl);
        return;
      }
      
      // The current URL will become the previous one for the transition out.
      setPreviousUrl(currentUrl);
      // The newly loaded image becomes the current one.
      setCurrentUrl(newUrl);
      setKenBurnsAnim(generateKenBurns()); // Generate new animation for new image
      onLoad();
    };

    img.onerror = () => {
      // Clean up the URL if the image fails to load.
      URL.revokeObjectURL(newUrl);
      if (!isStale) {
        onError();
      }
    };

    // The cleanup function marks this effect run as stale.
    // This prevents race conditions if the user changes images quickly.
    return () => {
      isStale = true;
    };
    // We remove `currentUrl` from the dependency array to prevent a re-render loop.
    // The old `currentUrl` is correctly captured in the closure for `setPreviousUrl`.
  }, [imageFile, onLoad, onError]);

  // Effect to clean up the `previousUrl` after the animation has finished.
  useEffect(() => {
    if (previousUrl) {
      const urlToRevoke = previousUrl;
      // After the animation, revoke the URL for the previous image.
      // We don't use a cleanup function here, so that even if the user scrubs
      // quickly, the timeout for each previous image will still fire and
      // revoke its URL, preventing memory leaks.
      setTimeout(() => {
        URL.revokeObjectURL(urlToRevoke);
      }, 1200); // Should match animation duration
    }
  }, [previousUrl]);

  const entryAnimation = previousUrl ? (transitions[transition] || transitions['fade-in']) : 'none';
  const kenBurnsAnimation = kenBurnsAnim ? `${kenBurnsAnim.name} 25s linear forwards` : '';
  const combinedAnimation = [entryAnimation, kenBurnsAnimation].filter(Boolean).join(', ');

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 overflow-hidden">
      {/* Previous image stays in the background during the transition */}
      {previousUrl && (
        <img
          key={previousUrl}
          src={previousUrl}
          alt=""
          className="max-w-full max-h-full object-contain absolute slideshow-image"
          aria-hidden="true"
        />
      )}
      {/* Current image animates in on top */}
      {currentUrl && (
        <img
          key={currentUrl}
          src={currentUrl}
          alt={imageFile?.name || 'Slideshow image'}
          className="max-w-full max-h-full object-contain absolute slideshow-image"
          // Only apply the animation if there was a previous image to transition from.
          style={{ animation: combinedAnimation }}
        />
      )}
      <style>
        {`
          .slideshow-image {
            /* Default styles for portrait or square */
            object-fit: contain;
          }
          @media (orientation: landscape) {
            .slideshow-image {
              /* Cover the screen in landscape, zoom a bit to hide edges during pan */
              object-fit: cover;
              width: 120%;
              height: 120%;
              max-width: none;
              max-height: none;
            }
          }
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
          ${kenBurnsAnim ? kenBurnsAnim.keyframe : ''}
        `}
      </style>
    </div>
  );
};

export default ImageDisplay;

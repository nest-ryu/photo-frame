
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ImageDisplay from './components/ImageDisplay';
import Controls from './components/Controls';
import { FolderIcon } from './components/icons';
import { Loader } from './components/Loader';

// Fix: Replaced `declare module 'react'` with `declare global` to correctly augment the type for `webkitDirectory` and make it globally available.
declare global {
  namespace React {
    interface InputHTMLAttributes<T> {
      webkitDirectory?: boolean;
    }
  }
}

const transitions = ['fade-in', 'zoom-in', 'slide-left', 'slide-right'];
const getRandomTransition = () => transitions[Math.floor(Math.random() * transitions.length)];


const App: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [transition, setTransition] = useState(transitions[0]);
  const controlsTimeoutRef = useRef<number | null>(null);
  const isInitialLoad = useRef(true);

  const handleFilesSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const fileList = Array.from(event.target.files);
      // Fix: Explicitly type `file` as `File` to resolve TypeScript error where `file` was inferred as `unknown`.
      const imageFiles = fileList.filter((file: File) => file.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        setImages(imageFiles);
        setCurrentIndex(0);
        setIsPlaying(true);
        setIsLoading(true); // Show loader only for the first image of the slideshow
        isInitialLoad.current = true;
      }
    }
  };

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setControlsVisible(true);
    controlsTimeoutRef.current = window.setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  }, []);

  useEffect(() => {
    resetControlsTimeout();
    const handleMouseMove = () => resetControlsTimeout();
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [resetControlsTimeout]);

  const handleNext = useCallback(() => {
    if (images.length > 0) {
      setTransition(getRandomTransition());
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }
  }, [images.length]);

  useEffect(() => {
    if (isPlaying && images.length > 1) {
      // Random interval between 10 and 30 seconds
      const randomInterval = Math.random() * (20000) + 10000; 
      const timer = setTimeout(() => {
        handleNext();
      }, randomInterval);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, images.length, currentIndex, handleNext]);


  const handlePrev = useCallback(() => {
    if (images.length > 0) {
      setTransition(getRandomTransition());
      setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }
  }, [images.length]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const handleImageLoad = useCallback(() => {
    // Only turn off loader on the very first image load of a slideshow
    if (isInitialLoad.current) {
      setIsLoading(false);
      isInitialLoad.current = false;
    }
  }, []);

  const handleIndexChange = useCallback((newIndex: number) => {
    if (images.length > 0 && newIndex !== currentIndex) {
      setTransition('fade-in'); // Use a simple fade for scrubbing
      setCurrentIndex(newIndex);
    }
  }, [images.length, currentIndex]);

  const handleExit = useCallback(() => {
    setImages([]);
    setCurrentIndex(0);
    setIsPlaying(true); // Reset to default
    setControlsVisible(true);
    isInitialLoad.current = true; // Reset for next slideshow
  }, []);


  return (
    <main className="relative w-screen h-screen bg-black text-white overflow-hidden select-none flex items-center justify-center">
      {images.length > 0 ? (
        <>
          {isLoading && <Loader />}
          <ImageDisplay 
            imageFile={images[currentIndex]}
            onLoad={handleImageLoad}
            onError={handleImageLoad} // Also hide loader on error
            transition={transition}
          />
          <div 
            className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 via-black/50 to-transparent transition-opacity duration-500 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}
          >
            <Controls
              onFilesSelect={handleFilesSelect}
              onNext={handleNext}
              onPrev={handlePrev}
              isPlaying={isPlaying}
              togglePlayPause={togglePlayPause}
              imageCount={images.length}
              currentIndex={currentIndex}
              onIndexChange={handleIndexChange}
              onExit={handleExit}
            />
          </div>
        </>
      ) : (
        <div className="text-center">
            <label htmlFor="folder-upload" className="cursor-pointer group">
              <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center bg-gray-800 rounded-full border-4 border-gray-700 group-hover:bg-gray-700 group-hover:border-blue-500 transition-all duration-300">
                  <FolderIcon className="w-16 h-16 text-gray-500 group-hover:text-blue-400 transition-colors" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-300">Digital Photo Frame</h1>
              <p className="mt-2 text-lg text-gray-400">Click to select a folder and start the slideshow.</p>
            </label>
            <input
              id="folder-upload"
              type="file"
              webkitDirectory
              multiple
              onChange={handleFilesSelect}
              className="hidden"
            />
        </div>
      )}
    </main>
  );
};

export default App;
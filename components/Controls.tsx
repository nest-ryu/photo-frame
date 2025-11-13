
import React from 'react';
import { PlayIcon, PauseIcon, NextIcon, PrevIcon, FolderOpenIcon, ExitIcon } from './icons';

interface ControlsProps {
  onFilesSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  onPrev: () => void;
  isPlaying: boolean;
  togglePlayPause: () => void;
  imageCount: number;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onExit: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  onFilesSelect,
  onNext,
  onPrev,
  isPlaying,
  togglePlayPause,
  imageCount,
  currentIndex,
  onIndexChange,
  onExit,
}) => {
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onIndexChange(Number(event.target.value));
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
      {/* Touch-friendly slider */}
      <input
        type="range"
        min="0"
        max={imageCount > 0 ? imageCount - 1 : 0}
        value={currentIndex}
        onChange={handleSliderChange}
        className="w-full h-2 bg-gray-700/50 rounded-lg appearance-none cursor-pointer range-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        aria-label="Image progress slider"
        disabled={imageCount === 0}
      />
      
      <div className="flex justify-between items-center gap-6">
        {/* Left Side: Folder Select & Image Count */}
        <div className="flex items-center gap-4 w-48 justify-start">
            <label htmlFor="folder-upload-controls" className="cursor-pointer text-gray-300 hover:text-white transition-colors">
                <FolderOpenIcon className="w-7 h-7" />
            </label>
            <input
              id="folder-upload-controls"
              type="file"
              webkitDirectory
              multiple
              onChange={onFilesSelect}
              className="hidden"
            />
            <span className="text-sm font-mono text-gray-400">
              {currentIndex + 1} / {imageCount}
            </span>
        </div>
        
        {/* Center: Playback Controls */}
        <div className="flex items-center gap-6">
          <button onClick={onPrev} className="text-gray-300 hover:text-white transition-colors" aria-label="Previous image">
            <PrevIcon className="w-8 h-8" />
          </button>
          <button onClick={togglePlayPause} className="text-white bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors" aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}>
            {isPlaying ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
          </button>
          <button onClick={onNext} className="text-gray-300 hover:text-white transition-colors" aria-label="Next image">
            <NextIcon className="w-8 h-8" />
          </button>
        </div>

        {/* Right side: Exit button */}
        <div className="flex items-center justify-end w-48">
          <button onClick={onExit} className="text-gray-300 hover:text-white transition-colors" aria-label="Exit slideshow">
            <ExitIcon className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;

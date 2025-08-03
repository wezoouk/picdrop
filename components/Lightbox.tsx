import React, { useEffect, useState, useRef } from 'react';
import { Photo } from '../types';
import Icon from './Icon';

interface LightboxProps {
  photo: Photo | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  weddingId?: string;
  isExample?: boolean;
  showShareButtons?: boolean;
  isSlideshowActive?: boolean;
  slideshowInterval?: number;
  slideshowTransition?: 'cut' | 'crossfade';
}

const Lightbox: React.FC<LightboxProps> = ({ 
  photo, 
  onClose, 
  onNext, 
  onPrev, 
  weddingId, 
  isExample, 
  showShareButtons = false,
  isSlideshowActive = false,
  slideshowInterval = 5000,
  slideshowTransition = 'cut',
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const lightboxRef = useRef<HTMLDivElement>(null);

  // State for crossfade transition
  const [slots, setSlots] = useState<(Photo | null)[]>([photo, null]);
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0);

  // This one effect now handles all logic related to photo changes and transition modes.
  useEffect(() => {
    if (!photo) return;

    if (slideshowTransition === 'crossfade' && isSlideshowActive) {
      // Logic for crossfading: put new photo in the inactive slot and make it active.
      const inactiveSlot = (1 - activeSlot) as 0 | 1;
      const newSlots = [...slots];
      newSlots[inactiveSlot] = photo;
      setSlots(newSlots);
      setActiveSlot(inactiveSlot);
    } else {
      // Fallback for 'cut' transition, manual navigation, or when slideshow is off.
      // This resets to a single-image view.
      setSlots([photo, null]);
      setActiveSlot(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo, isSlideshowActive, slideshowTransition]);

  useEffect(() => {
    setIsPlaying(isSlideshowActive);
  }, [isSlideshowActive]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') {
        setIsPlaying(false);
        onNext();
      }
      if (e.key === 'ArrowLeft') {
        setIsPlaying(false);
        onPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    let intervalId: number | undefined;
    if (isPlaying && isSlideshowActive && slideshowInterval) {
      intervalId = window.setInterval(() => {
        onNext();
      }, slideshowInterval);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [onClose, onNext, onPrev, isPlaying, isSlideshowActive, slideshowInterval]);

  if (!photo) return null;

  const handleFullscreenToggle = () => {
    if (!lightboxRef.current) return;
    if (!document.fullscreenElement) {
      lightboxRef.current.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleManualNav = (e: React.MouseEvent, navFunc: () => void) => {
    e.stopPropagation();
    setIsPlaying(false);
    navFunc();
  };
  
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(p => !p);
  };

  const galleryUrl = isExample
    ? `${window.location.origin}${window.location.pathname}#/example/gallery`
    : `${window.location.origin}${window.location.pathname}#/w/${weddingId}/gallery`;

  const shareText = `Check out this photo from our wedding gallery!`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(galleryUrl)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(galleryUrl)}&text=${encodeURIComponent(shareText)}`;
  const instagramShareUrl = `https://www.instagram.com`;

  return (
    <div ref={lightboxRef} className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="relative w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        
        {/* Controls */}
        <div className="absolute top-4 right-4 flex gap-3 z-50">
           {isSlideshowActive && (
              <button
                onClick={togglePlay}
                className="text-white bg-black/50 rounded-full p-2 hover:bg-white/20 transition-colors"
                aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
              >
                <Icon id={isPlaying ? 'pause' : 'play'} className="w-8 h-8" />
              </button>
           )}
           <button
            onClick={handleFullscreenToggle}
            className="text-white bg-black/50 rounded-full p-2 hover:bg-white/20 transition-colors"
            aria-label="Toggle fullscreen"
          >
            <Icon id={isFullscreen ? 'arrows-pointing-in' : 'arrows-pointing-out'} className="w-8 h-8" />
          </button>
          <button
            onClick={onClose}
            className="text-white bg-black/50 rounded-full p-2 hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <Icon id="close" className="w-8 h-8" />
          </button>
        </div>

        {/* Prev Button */}
        <button
            onClick={(e) => handleManualNav(e, onPrev)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2 hover:bg-white/20 transition-colors z-50"
            aria-label="Previous image"
        >
            <Icon id="arrow-left" className="w-8 h-8" />
        </button>

        {/* Next Button */}
        <button
            onClick={(e) => handleManualNav(e, onNext)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2 hover:bg-white/20 transition-colors z-50"
            aria-label="Next image"
        >
            <Icon id="arrow-right" className="w-8 h-8" />
        </button>

        <div className="flex flex-col items-center max-w-screen-lg max-h-full">
            <div className="relative max-w-full max-h-[80vh] flex items-center justify-center">
              {/* Ghost image to maintain container size and aspect ratio */}
              <img
                  src={photo.url}
                  alt=""
                  className="max-w-full max-h-[80vh] object-contain invisible"
                  aria-hidden="true"
              />
              
              {/* Image Slot 0 */}
              {slots[0] && (
                <img
                  key={slots[0].id + '-0'}
                  src={slots[0].url}
                  alt={slots[0].caption || 'Wedding moment'}
                  className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 ease-in-out rounded-lg shadow-2xl ${
                    activeSlot === 0 ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              )}
              {/* Image Slot 1 */}
              {slots[1] && (
                <img
                  key={slots[1].id + '-1'}
                  src={slots[1].url}
                  alt={slots[1].caption || 'Wedding moment'}
                  className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 ease-in-out rounded-lg shadow-2xl ${
                    activeSlot === 1 ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              )}
            </div>
            <div className="text-white text-center mt-4 p-4 rounded-lg bg-black/30 max-w-full">
                {photo.caption && <p className="break-words">{photo.caption}</p>}
                {photo.uploaderName && <p className="text-sm opacity-80 mt-1">by {photo.uploaderName}</p>}

                {/* Social Share & Download */}
                {showShareButtons && (
                    <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-white/20">
                        <a href={photo.url} download={`picdrop-${photo.id}.png`} className="flex items-center gap-2 px-4 py-2 text-sm rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                            <Icon id="download" className="w-5 h-5"/>
                            <span>Download</span>
                        </a>
                        <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 text-sm rounded-full bg-white/10 hover:bg-white/20 transition-colors" title="Share on Facebook">
                            <Icon id="facebook" className="w-5 h-5"/>
                        </a>
                        <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 text-sm rounded-full bg-white/10 hover:bg-white/20 transition-colors" title="Share on Twitter">
                            <Icon id="twitter" className="w-5 h-5"/>
                        </a>
                        <a href={instagramShareUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 text-sm rounded-full bg-white/10 hover:bg-white/20 transition-colors" title="Share on Instagram">
                            <Icon id="instagram" className="w-5 h-5"/>
                        </a>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

// Add fade-in animation to tailwind config or a global style tag
// For simplicity here, we'll assume a CSS animation is defined elsewhere.
// In a real app this would be in a CSS file or via a style tag in index.html
const style = document.createElement('style');
style.innerHTML = `
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-in-out;
}
`;
document.head.appendChild(style);


export default Lightbox;

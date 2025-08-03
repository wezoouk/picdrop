
import React, { useState } from 'react';
import { Photo } from '../types';
import Icon from './Icon';

interface PhotoCardProps {
  photo: Photo;
  onClick: () => void;
  className?: string;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onClick, className = '' }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  const isSensitiveAndHidden = photo.isSensitive && !isRevealed;

  const handleSensitiveClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent lightbox from opening
    setIsRevealed(true);
  };
  
  const handleCardClick = () => {
    if (!isSensitiveAndHidden) {
      onClick();
    }
  }

  return (
    <div
      className={`relative group cursor-pointer overflow-hidden rounded-lg shadow-md bg-soft-gray ${className}`}
      onClick={handleCardClick}
    >
      <img
        src={photo.url}
        alt={photo.caption || 'Wedding moment'}
        className={`w-full h-full object-cover transition-all duration-300 ease-in-out group-hover:scale-110 ${isSensitiveAndHidden ? 'blur-2xl scale-110' : ''}`}
        loading="lazy"
      />
      
      {isSensitiveAndHidden ? (
         <div 
          className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-center p-4 cursor-pointer"
          onClick={handleSensitiveClick}
        >
            <Icon id="eye-slash" className="w-8 h-8 mb-2" />
            <p className="font-semibold">Sensitive Content</p>
            <p className="text-sm">Click to view</p>
        </div>
      ) : (
        <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-3 text-white w-full">
                {photo.caption && <p className="text-sm font-sans font-light line-clamp-2">"{photo.caption}"</p>}
                {photo.uploaderName && <p className="text-xs font-sans font-semibold mt-1">by {photo.uploaderName}</p>}
            </div>
        </>
      )}
    </div>
  );
};

export default PhotoCard;

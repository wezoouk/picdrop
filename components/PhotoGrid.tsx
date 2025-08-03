
import React from 'react';
import { Photo } from '../types';
import PhotoCard from './PhotoCard';

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
  viewMode?: 'grid' | 'mosaic';
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, onPhotoClick, viewMode = 'grid' }) => {
  if (photos.length === 0) {
    return <p className="text-center text-gray-500 mt-8">No photos have been uploaded yet.</p>;
  }

  const getMosaicClass = (index: number) => {
    // This pattern creates a larger featured image every 5 photos.
    if ((index + 1) % 5 === 1) {
      return 'col-span-2 row-span-2';
    }
    return '';
  };

  const gridContainerClasses = {
    grid: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4',
    mosaic: 'grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 grid-flow-dense'
  }

  return (
    <div className={`${gridContainerClasses[viewMode]} px-2 sm:px-4`}>
      {photos.map((photo, index) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          onClick={() => onPhotoClick(photo)}
          className={viewMode === 'mosaic' ? getMosaicClass(index) : 'aspect-[2/3]'}
        />
      ))}
    </div>
  );
};

export default PhotoGrid;

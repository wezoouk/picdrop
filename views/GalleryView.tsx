
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Photo } from '../types';
import { getWedding, WeddingData } from '../services/weddingService';
import Header from '../components/Header';
import PhotoGrid from '../components/PhotoGrid';
import Lightbox from '../components/Lightbox';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import Icon from '../components/Icon';
import NavHeader from '../components/NavHeader';

interface GalleryViewProps {
  isExample?: boolean;
}

type ViewMode = 'grid' | 'mosaic';

const GalleryView: React.FC<GalleryViewProps> = ({ isExample = false }) => {
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
  const [publicPhotos, setPublicPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOrder, setSortOrder] = useState('newest');
  const navigate = useNavigate();
  const params = useParams();

  const weddingId = isExample ? 'example' : params.weddingId!;

  const fetchWeddingData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getWedding(weddingId);
      if (data) {
        setWeddingData(data);
        setPublicPhotos(data.photos.filter(p => p.isPublic));
      } else {
        navigate('/'); // Redirect if wedding not found
      }
    } catch (error) {
      console.error("Failed to fetch wedding data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [weddingId, navigate]);

  useEffect(() => {
    fetchWeddingData();
  }, [fetchWeddingData]);
  
  const sortedPublicPhotos = useMemo(() => {
    const sortablePhotos = [...publicPhotos];
    switch(sortOrder) {
      case 'oldest':
        return sortablePhotos.sort((a, b) => a.timestamp - b.timestamp);
      case 'uploader-az':
        return sortablePhotos.sort((a, b) => (a.uploaderName || '').localeCompare(b.uploaderName || ''));
      case 'uploader-za':
        return sortablePhotos.sort((a, b) => (b.uploaderName || '').localeCompare(a.uploaderName || ''));
      case 'newest':
      default:
        return sortablePhotos.sort((a, b) => b.timestamp - a.timestamp);
    }
  }, [publicPhotos, sortOrder]);


  const handlePhotoClick = (photo: Photo) => {
    const index = sortedPublicPhotos.findIndex(p => p.id === photo.id);
    setSelectedPhotoIndex(index);
  };
  
  const handleCloseLightbox = () => {
    setSelectedPhotoIndex(null);
  };

  const handleNext = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prevIndex) => (prevIndex! + 1) % sortedPublicPhotos.length);
  };

  const handlePrev = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prevIndex) => (prevIndex! - 1 + sortedPublicPhotos.length) % sortedPublicPhotos.length);
  };

  const basePath = isExample ? '/example' : `/w/${weddingId}`;
  
  if (isLoading || !weddingData) {
    return (
      <>
        <NavHeader />
        <div className="flex justify-center items-center h-screen">
          <Spinner size="lg" />
        </div>
      </>
    );
  }

  return (
    <>
      <NavHeader />
      <div>
        <Header
          coupleNames={weddingData.details.coupleNames}
          date={weddingData.details.date}
          message="A collection of beautiful moments captured by our beloved friends and family. Thank you for making our day unforgettable."
        />
        <main className="container mx-auto py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 px-4">
              <div className="flex gap-4">
                  <Button onClick={() => navigate(`${basePath}/upload`)}>
                      <Icon id="upload" className="w-5 h-5 mr-2" />
                      Add Your Photos
                  </Button>
                  <Button variant="outline" onClick={() => navigate(basePath)}>
                      <Icon id="home" className="w-5 h-5 mr-2" />
                      Back to Wedding Home
                  </Button>
              </div>
              <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label htmlFor="gallery-sort-order" className="text-sm font-medium text-dark-text">Sort by:</label>
                    <div className="relative">
                      <select 
                        id="gallery-sort-order"
                        value={sortOrder}
                        onChange={e => setSortOrder(e.target.value)}
                        className="block appearance-none w-full bg-dark-text text-white border-gold-accent/50 rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-accent sm:text-sm"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="uploader-az">Uploader Name (A-Z)</option>
                        <option value="uploader-za">Uploader Name (Z-A)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                        <Icon id="chevron-down" className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-blush p-1 rounded-lg">
                      <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gold-accent text-white shadow' : 'text-dark-text/70 hover:bg-gold-accent/10'}`} aria-label="Grid View">
                          <Icon id="squares-2x2" className="w-5 h-5"/>
                      </button>
                      <button onClick={() => setViewMode('mosaic')} className={`p-2 rounded-md transition-colors ${viewMode === 'mosaic' ? 'bg-gold-accent text-white shadow' : 'text-dark-text/70 hover:bg-gold-accent/10'}`} aria-label="Mosaic View">
                          <Icon id="rectangle-group" className="w-5 h-5"/>
                      </button>
                  </div>
              </div>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
            </div>
          ) : (
            <PhotoGrid photos={sortedPublicPhotos} onPhotoClick={handlePhotoClick} viewMode={viewMode} />
          )}
        </main>
        <Lightbox
          photo={selectedPhotoIndex !== null ? sortedPublicPhotos[selectedPhotoIndex] : null}
          onClose={handleCloseLightbox}
          onNext={handleNext}
          onPrev={handlePrev}
          weddingId={weddingId}
          isExample={isExample}
        />
        <footer className="py-8 text-center text-dark-text/70">
          <p>&copy; 2024 {weddingData.details.coupleNames}. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
};

export default GalleryView;

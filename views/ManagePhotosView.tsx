import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getWedding, deletePhotos, togglePhotoVisibility } from '../services/weddingService';
import { Photo } from '../types';
import NavHeader from '../components/NavHeader';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Icon from '../components/Icon';
import Lightbox from '../components/Lightbox';
import JSZip from 'jszip';

type SlideshowTransition = 'cut' | 'crossfade';

const ManagePhotosView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [pageTitle, setPageTitle] = useState('Manage Photos');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isDownloadingSelected, setIsDownloadingSelected] = useState(false);
  const [slideshowInterval, setSlideshowInterval] = useState(5000);
  const [isSlideshowActive, setIsSlideshowActive] = useState(false);
  const [slideshowTransition, setSlideshowTransition] = useState<SlideshowTransition>('cut');


  const isAdminView = location.pathname.startsWith('/admin');
  const weddingId = isAdminView ? params.weddingId : user?.weddingId;

  const fetchPhotos = useCallback(async () => {
    if (!weddingId) return;
    setIsLoading(true);
    try {
      const weddingData = await getWedding(weddingId);
      if (weddingData) {
        setPhotos(weddingData.photos);
        if (isAdminView) {
          setPageTitle(`Managing: ${weddingData.details.coupleNames}`);
        }
      } else {
        setError('Wedding page not found.');
      }
    } catch (err) {
      setError('Failed to load photos.');
    } finally {
      setIsLoading(false);
    }
  }, [weddingId, isAdminView]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const sortedPhotos = useMemo(() => {
    const sortablePhotos = [...photos];
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
  }, [photos, sortOrder]);
  
  const handleBack = () => {
    if (isAdminView) {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const handleToggleSelection = (photoId: string) => {
    setSelectedPhotos(prevSelected => {
        const newSelected = new Set(prevSelected);
        if (newSelected.has(photoId)) {
            newSelected.delete(photoId);
        } else {
            newSelected.add(photoId);
        }
        return newSelected;
    });
  };

  const handleSelectAllToggle = () => {
    if (selectedPhotos.size === photos.length) {
        setSelectedPhotos(new Set());
    } else {
        setSelectedPhotos(new Set(photos.map(p => p.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (!weddingId || !window.confirm(`Are you sure you want to permanently delete ${selectedPhotos.size} photo(s)?`)) return;
    
    setIsDeleting(true);
    try {
      await deletePhotos(weddingId, selectedPhotos);
      // Update local state directly for instant feedback.
      setPhotos(currentPhotos => currentPhotos.filter(p => !selectedPhotos.has(p.id)));
      setSelectedPhotos(new Set());
    } catch (err) {
      alert('Failed to delete photos. Please try again.');
    } finally {
        setIsDeleting(false);
    }
  };
  
  const handleDeleteSinglePhoto = async (photoId: string) => {
    if (!weddingId || !window.confirm(`Are you sure you want to permanently delete this photo?`)) return;

    setIsDeleting(true);
    try {
      await deletePhotos(weddingId, new Set([photoId]));
      // Update local state directly for instant feedback.
      setPhotos(currentPhotos => currentPhotos.filter(p => p.id !== photoId));
      setSelectedPhotos(prevSelected => {
        const newSelected = new Set(prevSelected);
        newSelected.delete(photoId);
        return newSelected;
      });
    } catch (err) {
      alert('Failed to delete photo. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadSelected = async () => {
    if (!weddingId || selectedPhotos.size === 0) return;
    setIsDownloadingSelected(true);
    try {
        const photosToDownload = photos.filter(p => selectedPhotos.has(p.id));

        if (photosToDownload.length === 1) {
          // Download single image directly
          const photo = photosToDownload[0];
          const response = await fetch(photo.url);
          const blob = await response.blob();
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `${photo.uploaderName || 'guest'}-${photo.id}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        } else {
          // Download multiple images as zip
          const zip = new JSZip();
          for (const photo of photosToDownload) {
              const response = await fetch(photo.url);
              const blob = await response.blob();
              zip.file(`${photo.uploaderName || 'guest'}-${photo.id}.png`, blob);
          }

          const content = await zip.generateAsync({ type: 'blob' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(content);
          link.download = `${weddingId}-selected-photos.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        }
    } catch(error) {
        console.error("Failed to download selected photos:", error);
        alert("There was an error creating the zip file for selected photos.");
    } finally {
        setIsDownloadingSelected(false);
    }
  };

  const handleDownloadSingleImage = async (photo: Photo) => {
    try {
        const response = await fetch(photo.url);
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${photo.uploaderName || 'guest'}-${photo.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error("Failed to download image:", error);
        alert("There was an error downloading the image. Please try again.");
    }
  };
  
  const handleToggleVisibility = async (photoId: string) => {
      if (!weddingId) return;
      try {
          const photoToToggle = photos.find(p => p.id === photoId);
          if (photoToToggle?.isPrivate) {
            alert("This photo was marked as private by the uploader and cannot be made public.");
            return;
          }
          const newVisibility = await togglePhotoVisibility(weddingId, photoId);
          setPhotos(prevPhotos =>
              prevPhotos.map(p => p.id === photoId ? { ...p, isPublic: newVisibility } : p)
          );
      } catch (err) {
          alert('Failed to update photo visibility. Please try again.');
      }
  };

  const handleViewPhoto = (photo: Photo) => {
    const index = sortedPhotos.findIndex(p => p.id === photo.id);
    setSelectedPhotoIndex(index);
  };
  
  const handleStartSlideshow = () => {
    if (sortedPhotos.length > 0) {
      setIsSlideshowActive(true);
      setSelectedPhotoIndex(0);
    }
  };

  const handleCloseLightbox = () => {
    setSelectedPhotoIndex(null);
    setIsSlideshowActive(false);
  };

  const handleNext = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prevIndex) => (prevIndex! + 1) % sortedPhotos.length);
  };

  const handlePrev = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prevIndex) => (prevIndex! - 1 + sortedPhotos.length) % sortedPhotos.length);
  };
  
  const weddingUrl = `${window.location.origin}${window.location.pathname}#/w/${weddingId}`;
  const shareText = `Check out this photo from our wedding gallery!`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(weddingUrl)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(weddingUrl)}&text=${encodeURIComponent(shareText)}`;
  const instagramShareUrl = `https://www.instagram.com`;


  return (
    <>
      <NavHeader />
      <div className="bg-blush/50 min-h-[calc(100vh-4rem)] py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-serif font-bold text-dark-text">{pageTitle}</h1>
                <p className="text-dark-text/80">Here you can review, download, and manage photo visibility.</p>
              </div>
              <Button variant="outline" onClick={handleBack}>
                {isAdminView ? 'Back to Admin' : 'Back to Dashboard'}
              </Button>
          </div>
          
          {photos.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Button size="sm" variant="secondary" onClick={handleSelectAllToggle}>
                {selectedPhotos.size === photos.length ? 'Deselect All' : 'Select All'}
              </Button>
              <div className="flex items-center gap-2">
                <label htmlFor="sort-order" className="text-sm font-medium text-dark-text">Sort by:</label>
                <div className="relative">
                  <select 
                    id="sort-order"
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
               <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleStartSlideshow}>
                  <Icon id="play" className="w-4 h-4 mr-2" />
                  Slideshow
                </Button>
                <select
                  value={slideshowInterval}
                  onChange={(e) => setSlideshowInterval(Number(e.target.value))}
                  className="bg-white border border-gray-300 rounded-md py-1.5 text-sm h-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-accent"
                  aria-label="Slideshow interval"
                >
                  <option value={3000}>3s</option>
                  <option value={5000}>5s</option>
                  <option value={10000}>10s</option>
                </select>
                <select
                  value={slideshowTransition}
                  onChange={(e) => setSlideshowTransition(e.target.value as SlideshowTransition)}
                  className="bg-white border border-gray-300 rounded-md py-1.5 text-sm h-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-accent"
                  aria-label="Slideshow transition"
                >
                  <option value="cut">Cut</option>
                  <option value="crossfade">Crossfade</option>
                </select>
              </div>
            </div>
          )}

          {selectedPhotos.size > 0 && (
              <div className="sticky top-[70px] z-30 bg-ivory/90 backdrop-blur-sm p-4 rounded-lg shadow-md mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 border border-gold-accent/20">
                  <p className="font-semibold">{selectedPhotos.size} photo(s) selected</p>
                  <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={handleDownloadSelected} disabled={isDownloadingSelected}>
                          {isDownloadingSelected ? <Spinner size="sm" color="border-white" /> : <Icon id="download" className="w-4 h-4 mr-2" />}
                          {isDownloadingSelected ? 'Zipping...' : 'Download Selected'}
                      </Button>
                      <Button variant="secondary" size="sm" className="!bg-red-600 hover:!bg-red-700" onClick={handleDeleteSelected} disabled={isDeleting}>
                          {isDeleting ? <Spinner size="sm" color="border-white" /> : <Icon id="trash" className="w-4 h-4 mr-2" />}
                          {isDeleting ? 'Deleting...' : 'Delete Selected'}
                      </Button>
                  </div>
              </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : photos.length === 0 ? (
            <div className="text-center py-16 bg-white/80 rounded-lg shadow-md border border-gold-accent/10">
                <Icon id="gallery" className="w-16 h-16 mx-auto text-gold-accent/50" />
                <h2 className="mt-4 text-xl font-semibold text-dark-text">No Photos Yet</h2>
                <p className="text-dark-text/70 mt-2">This gallery is currently empty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {sortedPhotos.map(photo => {
                const isSelected = selectedPhotos.has(photo.id);
                return (
                    <div 
                        key={photo.id} 
                        className={`relative group aspect-[2/3] bg-soft-gray rounded-lg overflow-hidden shadow-md cursor-pointer transition-all duration-200 ${isSelected ? 'ring-4 ring-gold-accent scale-95' : ''} ${!photo.isPublic ? 'opacity-60' : ''}`}
                        onClick={() => handleToggleSelection(photo.id)}
                    >
                        <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                        
                        <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                            <div className="relative group/tooltip">
                                <button
                                    className="p-1.5 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors"
                                    onClick={() => handleDeleteSinglePhoto(photo.id)}
                                    aria-label="Delete photo"
                                >
                                    <Icon id="trash" className="w-4 h-4" />
                                </button>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-dark-text text-white text-xs rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none">
                                    Delete Photo
                                </div>
                            </div>
                        </div>

                        {photo.isPrivate ? (
                          <div className="absolute top-2 right-2 p-1 rounded-full bg-blue-500 text-white shadow-lg" title="Private (couple's eyes only)">
                              <Icon id="lock-closed" className="w-4 h-4" />
                          </div>
                        ) : photo.isSensitive && (
                           <div className="absolute top-2 right-2 p-1 rounded-full bg-yellow-400 text-black shadow-lg" title="Marked as sensitive by uploader">
                               <Icon id="eye-slash" className="w-4 h-4" />
                           </div>
                        )}

                        <div 
                           className={`absolute top-2 right-2 p-1 rounded-full transition-colors ${isSelected ? 'bg-gold-accent text-white' : 'bg-white/50 text-dark-text'} ${photo.isPrivate || photo.isSensitive ? 'hidden' : ''}`}
                        >
                            <Icon id="check" className="w-4 h-4" />
                        </div>

                        <div className="absolute bottom-2 right-2 flex flex-wrap justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                           <div className="relative group/tooltip">
                                <button className="p-2 bg-dark-text/70 text-white rounded-full hover:bg-dark-text" onClick={() => handleDownloadSingleImage(photo)}>
                                    <Icon id="download" className="w-5 h-5" />
                                </button>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-dark-text text-white text-xs rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none">Download</div>
                            </div>
                            <div className="relative group/tooltip">
                                <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer" className="block p-2 bg-dark-text/70 text-white rounded-full hover:bg-dark-text">
                                    <Icon id="facebook" className="w-5 h-5" />
                                </a>
                            </div>
                            <div className="relative group/tooltip">
                                <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer" className="block p-2 bg-dark-text/70 text-white rounded-full hover:bg-dark-text">
                                    <Icon id="twitter" className="w-5 h-5" />
                                </a>
                            </div>
                            <div className="relative group/tooltip">
                                <a href={instagramShareUrl} target="_blank" rel="noopener noreferrer" className="block p-2 bg-dark-text/70 text-white rounded-full hover:bg-dark-text">
                                    <Icon id="instagram" className="w-5 h-5" />
                                </a>
                            </div>
                           <div className="relative group/tooltip">
                                <button className="p-2 bg-dark-text/70 text-white rounded-full hover:bg-dark-text" onClick={() => handleViewPhoto(photo)}>
                                    <Icon id="magnifying-glass-plus" className="w-5 h-5" />
                                </button>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-dark-text text-white text-xs rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none">
                                    View Photo
                                </div>
                            </div>
                             <div className="relative group/tooltip">
                                <button className="p-2 bg-dark-text/70 text-white rounded-full hover:bg-dark-text" onClick={() => handleToggleVisibility(photo.id)}>
                                    <Icon id={photo.isPublic ? 'eye' : 'eye-slash'} className="w-5 h-5" />
                                </button>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-dark-text text-white text-xs rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                    {photo.isPublic ? 'Hide from Public Gallery' : 'Show in Public Gallery'}
                                </div>
                            </div>
                        </div>
                    </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Lightbox
          photo={selectedPhotoIndex !== null ? sortedPhotos[selectedPhotoIndex] : null}
          onClose={handleCloseLightbox}
          onNext={handleNext}
          onPrev={handlePrev}
          weddingId={weddingId}
          isExample={false}
          showShareButtons={true}
          isSlideshowActive={isSlideshowActive}
          slideshowInterval={slideshowInterval}
          slideshowTransition={slideshowTransition}
        />
    </>
  );
};

export default ManagePhotosView;
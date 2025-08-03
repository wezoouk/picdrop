
import React, { useState, useRef } from 'react';
import { uploadPhotos, UploadData } from '../services/weddingService';
import Button from './Button';
import Icon from './Icon';
import Spinner from './Spinner';

interface UploadableFile {
  file: File;
  previewUrl: string;
  caption: string;
  isSensitive: boolean;
  isPrivate: boolean;
}

interface UploadFormProps {
  weddingId: string;
  onUploadSuccess: () => void;
  onViewGalleryClick?: () => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ weddingId, onUploadSuccess, onViewGalleryClick }) => {
  const [uploadableFiles, setUploadableFiles] = useState<UploadableFile[]>([]);
  const [uploaderName, setUploaderName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      const newUploadables: UploadableFile[] = newFiles.map(file => ({
        file,
        previewUrl: URL.createObjectURL(file),
        caption: '',
        isSensitive: false,
        isPrivate: false,
      }));
      setUploadableFiles(prev => [...prev, ...newUploadables]);
    }
  };

  const removeUploadableFile = (indexToRemove: number) => {
    setUploadableFiles(currentFiles => {
      const fileToRemove = currentFiles[indexToRemove];
      if (fileToRemove) {
          URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return currentFiles.filter((_, index) => index !== indexToRemove);
    });
  };
  
  const handleCaptionChange = (index: number, newCaption: string) => {
    setUploadableFiles(currentFiles => {
      const updatedFiles = [...currentFiles];
      if (updatedFiles[index]) {
        updatedFiles[index].caption = newCaption;
      }
      return updatedFiles;
    });
  };

  const handleSensitiveChange = (index: number, checked: boolean) => {
    setUploadableFiles(currentFiles => {
      const updatedFiles = [...currentFiles];
      if (updatedFiles[index]) {
        updatedFiles[index].isSensitive = checked;
      }
      return updatedFiles;
    });
  };

  const handlePrivateChange = (index: number, checked: boolean) => {
    setUploadableFiles(currentFiles => {
      const updatedFiles = [...currentFiles];
      if (updatedFiles[index]) {
        updatedFiles[index].isPrivate = checked;
        if (checked) {
          updatedFiles[index].isSensitive = false;
        }
      }
      return updatedFiles;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadableFiles.length === 0) {
      setError('Please select at least one photo to upload.');
      return;
    }
    setError('');
    setIsUploading(true);
    setSuccessMessage('');

    try {
      const uploadData: UploadData[] = uploadableFiles.map(item => ({
        file: item.file,
        caption: item.caption,
        uploaderName,
        isSensitive: item.isSensitive,
        isPrivate: item.isPrivate,
      }));
      await uploadPhotos(weddingId, uploadData);
      setSuccessMessage(`Thank you! ${uploadableFiles.length} photo(s) uploaded successfully. 🎉`);
      
      uploadableFiles.forEach(item => URL.revokeObjectURL(item.previewUrl));
      setUploadableFiles([]);
      
    } catch (err) {
      setError('Something went wrong during the upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSuccessMessage('');
  };

  return (
    <div className="w-full max-w-lg mx-auto p-8 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-gold-accent/20">
      {isUploading ? (
        <div className="flex flex-col items-center justify-center space-y-4 py-16">
          <Spinner size="lg" />
          <p className="text-lg font-semibold text-dark-text">Uploading your moments...</p>
        </div>
      ) : successMessage ? (
        <div className="flex flex-col items-center justify-center space-y-6 py-16 text-center">
            <Icon id="check" className="w-16 h-16 text-green-500" />
            <p className="text-xl font-semibold text-dark-text">{successMessage}</p>
            <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={resetForm} leftIcon={<Icon id="upload" className="w-5 h-5 mr-2" />}>
                    Upload More
                </Button>
                {onViewGalleryClick && (
                    <Button variant="outline" onClick={onViewGalleryClick} leftIcon={<Icon id="gallery" className="w-5 h-5 mr-2"/>}>
                        View Gallery
                    </Button>
                )}
            </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" />
            <Button type="button" variant="outline" onClick={() => cameraInputRef.current?.click()} leftIcon={<Icon id="camera" />}>Take Photo</Button>
            
            <input type="file" accept="image/*" multiple ref={galleryInputRef} onChange={handleFileChange} className="hidden" />
            <Button type="button" variant="outline" onClick={() => galleryInputRef.current?.click()} leftIcon={<Icon id="gallery" />}>From Gallery</Button>
          </div>

          {uploadableFiles.length > 0 && (
            <div className="space-y-4 max-h-72 overflow-y-auto pr-2 -mr-2">
              <h3 className="font-semibold text-dark-text">Add comments to your photos:</h3>
              {uploadableFiles.map((item, index) => (
                <div key={item.previewUrl} className="flex items-start gap-4 p-2 bg-blush/50 rounded-lg">
                  <img src={item.previewUrl} alt="Preview" className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
                  <div className="flex-grow">
                    <textarea
                      value={item.caption}
                      onChange={(e) => handleCaptionChange(index, e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gold-accent focus:border-gold-accent text-sm"
                      placeholder="Add a message for this photo..."
                    />
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`private-${index}`}
                          checked={item.isPrivate}
                          onChange={(e) => handlePrivateChange(index, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-gold-accent focus:ring-gold-accent"
                        />
                        <label htmlFor={`private-${index}`} className="ml-2 block text-xs text-dark-text/80">
                          Private (couple's eyes only)
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`sensitive-${index}`}
                          checked={item.isSensitive}
                          onChange={(e) => handleSensitiveChange(index, e.target.checked)}
                          disabled={item.isPrivate}
                          className="h-4 w-4 rounded border-gray-300 text-gold-accent focus:ring-gold-accent disabled:opacity-50"
                        />
                        <label htmlFor={`sensitive-${index}`} className="ml-2 block text-xs text-dark-text/80">
                          Mark as sensitive (will be blurred)
                        </label>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeUploadableFile(index)}
                    className="p-1 text-red-500 hover:bg-red-100 rounded-full flex-shrink-0"
                    aria-label="Remove photo"
                  >
                    <Icon id="close" className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-dark-text">Your Name (Optional)</label>
            <input type="text" id="name" value={uploaderName} onChange={(e) => setUploaderName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gold-accent focus:border-gold-accent" placeholder="Jane Doe" />
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" disabled={uploadableFiles.length === 0} className="w-full" leftIcon={<Icon id="upload" />}>
            Upload {uploadableFiles.length > 0 ? `${uploadableFiles.length} Photo(s)` : ''}
          </Button>
        </form>
      )}
    </div>
  );
};

export default UploadForm;

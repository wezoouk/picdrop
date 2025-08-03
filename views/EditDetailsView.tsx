
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getWedding, updateWeddingDetails, WeddingDetails } from '../services/weddingService';
import NavHeader from '../components/NavHeader';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Icon from '../components/Icon';
import Calendar from '../components/Calendar';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const EditDetailsView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [details, setDetails] = useState<WeddingDetails>({ coupleNames: '', date: '', message: '', profileImageUrl: '', backgroundImageUrl: '', backgroundPosition: 'center', contentBackgroundColor: 'rgba(253, 248, 245, 0.9)' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const calendarRef = useRef<HTMLDivElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const fetchDetails = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const weddingData = await getWedding(user.weddingId);
    if (weddingData) {
      setDetails({
          ...weddingData.details,
          backgroundPosition: weddingData.details.backgroundPosition || 'center',
          contentBackgroundColor: weddingData.details.contentBackgroundColor || 'rgba(253, 248, 245, 0.9)',
      });
    } else {
      setError('Could not load your wedding details.');
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
            setIsCalendarOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [calendarRef]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDetails({
      ...details,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'profileImageUrl' | 'backgroundImageUrl') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsSaving(true); // Show feedback while converting
      const base64 = await fileToBase64(file);
      setDetails((prev) => ({
        ...prev,
        [field]: base64,
      }));
      setIsSaving(false);
    }
  };
  
  const handleBackgroundPosition = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    setDetails(prev => ({
      ...prev,
      backgroundPosition: `${xPercent.toFixed(1)}% ${yPercent.toFixed(1)}%`,
    }));
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const opacity = e.target.value;
    setDetails(prev => ({
        ...prev,
        contentBackgroundColor: `rgba(253, 248, 245, ${opacity})`,
    }));
  };
  
  const getCurrentOpacity = () => {
    try {
        const opacityValue = details.contentBackgroundColor?.match(/rgba?\(.*,\s*([\d.]+)\)/)?.[1];
        return opacityValue ? parseFloat(opacityValue) : 0.9;
    } catch {
        return 0.9;
    }
  };


  const parseDate = (dateString: string): Date | null => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  const handleDateSelect = (date: Date) => {
    setDetails(prev => ({ 
        ...prev, 
        date: date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) 
    }));
    setIsCalendarOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateWeddingDetails(user.weddingId, details);
      setSuccess('Your details have been updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save details. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <NavHeader />
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <Spinner size="lg" />
        </div>
      </>
    );
  }

  return (
    <>
      <NavHeader />
      <div className="bg-blush/50 min-h-[calc(100vh-4rem)] py-12">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-ivory p-8 rounded-xl shadow-lg border border-gold-accent/20">
            <h1 className="text-3xl font-serif font-bold text-dark-text mb-2">Edit Your Page Details</h1>
            <p className="text-dark-text/80 mb-6">This information will be displayed on your public wedding page for all your guests to see.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="coupleNames" className="block text-sm font-medium text-dark-text">Couple's Names</label>
                <input type="text" name="coupleNames" id="coupleNames" value={details.coupleNames} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gold-accent focus:border-gold-accent" />
              </div>
              <div className="relative" ref={calendarRef}>
                <label htmlFor="date" className="block text-sm font-medium text-dark-text">Wedding Date</label>
                <button
                    type="button"
                    id="date"
                    onClick={() => setIsCalendarOpen(o => !o)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-accent"
                >
                    <span>{details.date || 'Select a date'}</span>
                    <Icon id="calendar" className="w-5 h-5 text-gray-400" />
                </button>
                {isCalendarOpen && (
                    <Calendar
                        selectedDate={parseDate(details.date)}
                        onDateSelect={handleDateSelect}
                        onClose={() => setIsCalendarOpen(false)}
                    />
                )}
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-dark-text">Welcome Message for Guests</label>
                <textarea name="message" id="message" value={details.message} onChange={handleChange} rows={4} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gold-accent focus:border-gold-accent" />
              </div>

              <hr className="my-6 border-gold-accent/20" />

              <h2 className="text-xl font-serif font-bold text-dark-text -mb-2">Page Appearance</h2>
              
              {/* Profile Photo Upload */}
              <div>
                  <label className="block text-sm font-medium text-dark-text">Profile Photo</label>
                  <div className="mt-2 flex items-center gap-4">
                      <span className="inline-block h-20 w-20 rounded-full overflow-hidden bg-soft-gray ring-2 ring-white shadow-sm">
                          {details.profileImageUrl ? (
                              <img src={details.profileImageUrl} alt="Profile Preview" className="h-full w-full object-cover" />
                          ) : (
                              <Icon id="heart" className="h-full w-full text-gold-accent/20 p-4" />
                          )}
                      </span>
                      <input type="file" accept="image/*" ref={profileInputRef} onChange={(e) => handleFileChange(e, 'profileImageUrl')} className="hidden" />
                      <Button type="button" variant="outline" size="sm" onClick={() => profileInputRef.current?.click()}>Change Photo</Button>
                  </div>
              </div>

              {/* Background Image Upload */}
              <div>
                  <label className="block text-sm font-medium text-dark-text">Background Image</label>
                  <p className="text-xs text-dark-text/70">Click on the preview to set the focus point.</p>
                  <div className="mt-2">
                      <div 
                        className="relative w-full aspect-video rounded-lg bg-soft-gray overflow-hidden ring-2 ring-white shadow-sm flex items-center justify-center cursor-pointer"
                        style={{backgroundImage: `url(${details.backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center'}}
                        onClick={handleBackgroundPosition}
                      >
                          {!details.backgroundImageUrl && <Icon id="gallery" className="h-12 w-12 text-gold-accent/20" />}
                          {details.backgroundPosition && details.backgroundImageUrl && (
                             <div className="absolute w-4 h-4 rounded-full bg-white/70 ring-2 ring-black" style={{ left: details.backgroundPosition.split(' ')[0], top: details.backgroundPosition.split(' ')[1], transform: 'translate(-50%, -50%)' }}></div>
                          )}
                      </div>
                      <input type="file" accept="image/*" ref={backgroundInputRef} onChange={(e) => handleFileChange(e, 'backgroundImageUrl')} className="hidden" />
                      <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => backgroundInputRef.current?.click()}>Change Background</Button>
                  </div>
              </div>
              
              {/* Content Box Opacity */}
              <div>
                  <label htmlFor="opacity" className="block text-sm font-medium text-dark-text">Content Box Transparency</label>
                  <input
                      id="opacity"
                      type="range"
                      min="0.5"
                      max="1"
                      step="0.05"
                      value={getCurrentOpacity()}
                      onChange={handleOpacityChange}
                      className="w-full h-2 bg-blush rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-dark-text/70">
                      <span>More Transparent</span>
                      <span>Opaque</span>
                  </div>
              </div>


              {error && <p className="text-red-500 text-sm pt-4">{error}</p>}
              {success && <p className="text-green-600 text-sm pt-4">{success}</p>}

              <div className="flex items-center justify-end gap-4 pt-6">
                 <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Spinner size="sm" color="border-white" /> : <Icon id="check" className="w-5 h-5" />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditDetailsView;

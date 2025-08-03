
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Icon from '../components/Icon';
import NavHeader from '../components/NavHeader';
import { getWedding, WeddingData } from '../services/weddingService';
import Spinner from '../components/Spinner';

interface WeddingHomeViewProps {
  isExample?: boolean;
}

const WeddingHomeView: React.FC<WeddingHomeViewProps> = ({ isExample = false }) => {
  const params = useParams();
  const navigate = useNavigate();
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const weddingId = isExample ? 'example' : params.weddingId!;

  useEffect(() => {
    const fetchWeddingData = async () => {
      setIsLoading(true);
      const data = await getWedding(weddingId);
      if (data) {
        setWeddingData(data);
      } else {
        navigate('/'); // Redirect to home if wedding not found
      }
      setIsLoading(false);
    };

    if (weddingId) {
      fetchWeddingData();
    }
  }, [weddingId, navigate]);

  if (isLoading || !weddingData) {
    return (
      <>
        <NavHeader />
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="lg" />
        </div>
      </>
    );
  }
  
  const basePath = isExample ? '/example' : `/w/${weddingId}`;
  const backgroundStyle = {
    backgroundImage: `url('${weddingData.details.backgroundImageUrl || 'https://picsum.photos/seed/weddingbg/1920/1080'}')`,
    backgroundPosition: weddingData.details.backgroundPosition || 'center',
  };

  const contentContainerStyle = {
    backgroundColor: weddingData.details.contentBackgroundColor || 'rgba(253, 248, 245, 0.9)',
  };

  return (
    <>
      <NavHeader />
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-cover bg-center transition-all duration-500" style={backgroundStyle}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 p-8 backdrop-blur-sm rounded-xl shadow-2xl max-w-2xl text-dark-text w-full" style={contentContainerStyle}>
          
          {weddingData.details.profileImageUrl && (
            <img 
              src={weddingData.details.profileImageUrl}
              alt={weddingData.details.coupleNames}
              className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-white shadow-xl"
            />
          )}

          <h1 className="font-serif text-4xl md:text-6xl text-dark-text font-bold tracking-tight">
            {weddingData.details.coupleNames}
          </h1>
          <p className="mt-2 text-lg text-gold-accent font-semibold">{weddingData.details.date}</p>
          
          <p className="mt-8 text-base max-w-xl mx-auto">
            {weddingData.details.message}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to={`${basePath}/upload`}>
              <Button variant="primary" className="w-64 sm:w-auto">
                <Icon id="camera" className="w-5 h-5 mr-2"/>
                Upload Your Photos
              </Button>
            </Link>
            <Link to={`${basePath}/gallery`}>
              <Button variant="outline" className="w-64 sm:w-auto">
                  <Icon id="gallery" className="w-5 h-5 mr-2"/>
                  View Our Gallery
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default WeddingHomeView;

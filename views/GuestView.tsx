
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import UploadForm from '../components/UploadForm';
import Button from '../components/Button';
import Icon from '../components/Icon';
import NavHeader from '../components/NavHeader';
import { getWedding, WeddingData } from '../services/weddingService';
import Spinner from '../components/Spinner';

interface GuestViewProps {
  isExample?: boolean;
}

const GuestView: React.FC<GuestViewProps> = ({ isExample = false }) => {
  const navigate = useNavigate();
  const params = useParams();
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
        // Handle case where weddingId is not found, maybe redirect
        navigate('/');
      }
      setIsLoading(false);
    };
    fetchWeddingData();
  }, [weddingId, navigate]);

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
      <div className="flex flex-col">
        <Header
          coupleNames={weddingData.details.coupleNames}
          date={weddingData.details.date}
          message="Thank you for being a part of our special day! Please share the photos and videos you capture to help us remember every moment."
        />
        <main className="flex-grow container mx-auto px-4 py-8">
          <UploadForm 
            weddingId={weddingId}
            onUploadSuccess={() => {}} 
            onViewGalleryClick={() => navigate(`${basePath}/gallery`)} 
          />
        </main>
        <footer className="py-6 text-center">
          <Button variant="outline" onClick={() => navigate(`${basePath}/gallery`)}>
              <Icon id="gallery" className="w-5 h-5 mr-2"/>
              Go to Gallery
          </Button>
        </footer>
      </div>
    </>
  );
};

export default GuestView;
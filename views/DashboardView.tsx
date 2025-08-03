import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NavHeader from '../components/NavHeader';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { QRCodeCanvas } from 'qrcode.react';
import Spinner from '../components/Spinner';
import JSZip from 'jszip';
import { getWedding } from '../services/weddingService';

const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [emails, setEmails] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  if (!user) {
    return null; // Or a loading spinner
  }
  
  const weddingUrl = `${window.location.origin}${window.location.pathname}#/w/${user.weddingId}`;

  const handleDownloadQR = () => {
    const canvas = qrCodeRef.current?.querySelector<HTMLCanvasElement>('canvas');
    if (canvas) {
        const pngUrl = canvas
            .toDataURL('image/png')
            .replace('image/png', 'image/octet-stream');
        let downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `${user.weddingId}-qr-code.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(weddingUrl).then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
    }, () => {
        setCopySuccess('Failed to copy');
        setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  const handleDownloadAll = async () => {
    if (!user) return;
    setIsDownloading(true);
    try {
        const weddingData = await getWedding(user.weddingId);
        if (!weddingData || weddingData.photos.length === 0) {
            alert("No photos to download.");
            return;
        }

        const zip = new JSZip();
        const publicPhotos = weddingData.photos.filter(p => p.isPublic);

        if (publicPhotos.length === 0) {
            alert("No public photos to download.");
            return;
        }
        
        // This is a simplified version. For large numbers of photos,
        // fetching them one by one might be slow.
        for (const photo of publicPhotos) {
            const response = await fetch(photo.url);
            const blob = await response.blob();
            zip.file(`${photo.uploaderName || 'guest'}-${photo.id}.png`, blob);
        }

        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${user.weddingId}-photos.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

    } catch (error) {
        console.error("Failed to download photos:", error);
        alert("There was an error creating the zip file.");
    } finally {
        setIsDownloading(false);
    }
  }

  const handleSendInvites = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emails.trim()) return;

    setIsSending(true);
    setSendSuccess('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSending(false);
    setSendSuccess(`Invitations sent to ${emails.split('\n').filter(Boolean).length} guest(s)!`);
    setEmails('');
    setTimeout(() => setSendSuccess(''), 4000);
  };

  const shareText = `Join us for our wedding celebration! Check out our page and share your photos:`;
  const shareSubject = `Our Wedding Day: ${user.name}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(weddingUrl)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(weddingUrl)}&text=${encodeURIComponent(shareText)}`;
  const instagramShareUrl = `https://www.instagram.com`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + weddingUrl)}`;
  const emailShareUrl = `mailto:?subject=${encodeURIComponent(shareSubject)}&body=${encodeURIComponent(shareText + ' ' + weddingUrl)}`;


  return (
    <>
      <NavHeader />
      <div className="bg-blush/50 min-h-[calc(100vh-4rem)]">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-serif font-bold text-dark-text">Welcome, {user.name}!</h1>
            <p className="mt-1 text-dark-text/80">This is your personal dashboard. Manage your wedding page from here.</p>
          </div>
        </header>
        <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            
            {/* Wedding Page Card */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gold-accent/20 flex flex-col h-full">
              <h2 className="font-serif text-2xl font-bold text-dark-text mb-4">Your Wedding Page</h2>
              <p className="text-dark-text/80 mb-4 flex-grow">Your public page is where guests will upload photos and see your gallery.</p>
              <div className="space-y-3 mt-auto">
                <Link to={`/w/${user.weddingId}`}>
                    <Button variant="primary" className="w-full">
                        <Icon id="gallery" className="w-5 h-5 mr-2" />
                        View Public Page
                    </Button>
                </Link>
                <Link to="/dashboard/edit">
                  <Button variant="outline" className="w-full">
                    <Icon id="sparkles" className="w-5 h-5 mr-2" />
                    Edit Page Details
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Share Page Card */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gold-accent/20 flex flex-col items-center h-full">
              <h2 className="font-serif text-2xl font-bold text-dark-text mb-4">Share Your Page</h2>
              <div ref={qrCodeRef} className="p-2 bg-white rounded-lg border border-soft-gray">
                  <QRCodeCanvas
                      value={weddingUrl}
                      size={140}
                      level={"H"}
                      includeMargin={true}
                  />
              </div>
              <p className="text-xs text-dark-text/70 mt-3 text-center break-all">{weddingUrl}</p>
              <div className="mt-auto pt-4 w-full">
                <div className="space-y-3">
                    <Button variant="secondary" className="w-full" onClick={handleDownloadQR}>
                        <Icon id="qr-code" className="w-5 h-5 mr-2" />
                        Download QR
                    </Button>
                    <Button variant="outline" className="w-full" onClick={handleCopyLink}>
                        <Icon id="clipboard-document" className="w-5 h-5 mr-2" />
                        {copySuccess || 'Copy Link'}
                    </Button>
                </div>
                
                <div className="flex items-center gap-2 mt-4">
                  <hr className="flex-grow border-t border-soft-gray" />
                  <span className="text-xs text-dark-text/70">share</span>
                  <hr className="flex-grow border-t border-soft-gray" />
                </div>

                <div className="flex justify-center gap-3 mt-3">
                  <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer" title="Share on Facebook" className="w-10 h-10 flex items-center justify-center rounded-full bg-dark-text text-white hover:opacity-90 transition-opacity">
                      <Icon id="facebook" className="w-5 h-5" />
                  </a>
                  <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer" title="Share on Twitter" className="w-10 h-10 flex items-center justify-center rounded-full bg-dark-text text-white hover:opacity-90 transition-opacity">
                      <Icon id="twitter" className="w-6 h-6 p-0.5" />
                  </a>
                  <a href={instagramShareUrl} target="_blank" rel="noopener noreferrer" title="Share on Instagram" className="w-10 h-10 flex items-center justify-center rounded-full bg-dark-text text-white hover:opacity-90 transition-opacity">
                      <Icon id="instagram" className="w-5 h-5" />
                  </a>
                  <a href={whatsappShareUrl} target="_blank" rel="noopener noreferrer" title="Share on WhatsApp" className="w-10 h-10 flex items-center justify-center rounded-full bg-dark-text text-white hover:opacity-90 transition-opacity">
                      <Icon id="whatsapp" className="w-6 h-6" />
                  </a>
                  <a href={emailShareUrl} title="Share via Email" className="w-10 h-10 flex items-center justify-center rounded-full bg-dark-text text-white hover:opacity-90 transition-opacity">
                      <Icon id="envelope" className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Photo Management Card */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gold-accent/20 flex flex-col h-full">
              <h2 className="font-serif text-2xl font-bold text-dark-text mb-4">Manage Photos</h2>
               <p className="text-dark-text/80 mb-4 flex-grow">Review and download the photos submitted by your guests.</p>
               <div className="space-y-3 mt-auto">
                <Link to="/dashboard/photos">
                  <Button variant="secondary" className="w-full">
                      <Icon id="check" className="w-5 h-5 mr-2" />
                      Review Submissions
                  </Button>
                </Link>
                <Button variant="outline" className="w-full" onClick={handleDownloadAll} disabled={isDownloading}>
                  {isDownloading ? <Spinner size="sm" color="border-gold-accent"/> : <Icon id="download" className="w-5 h-5 mr-2" />}
                  {isDownloading ? 'Zipping...' : 'Download All Photos'}
                </Button>
              </div>
            </div>
            
            {/* Email Invitations Card */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gold-accent/20 flex flex-col h-full">
              <h2 className="font-serif text-2xl font-bold text-dark-text mb-4">Email Invitations</h2>
              <form onSubmit={handleSendInvites} className="flex flex-col flex-grow">
                <p className="text-dark-text/80 mb-4 flex-grow">Enter guest emails (one per line) to send them a link to your page.</p>
                <textarea
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  placeholder="guest1@example.com&#10;guest2@example.com"
                  rows={4}
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gold-accent focus:border-gold-accent transition-all"
                  disabled={isSending}
                />
                <div className="mt-auto pt-4">
                  {sendSuccess && <p className="text-sm text-green-600 mb-2 text-center">{sendSuccess}</p>}
                  <Button type="submit" className="w-full" disabled={isSending || !emails.trim()}>
                    {isSending ? <Spinner size="sm" color="border-white" /> : <Icon id="envelope" className="w-5 h-5 mr-2" />}
                    {isSending ? 'Sending...' : 'Send Invites'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Settings Card */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gold-accent/20 flex flex-col h-full">
              <h2 className="font-serif text-2xl font-bold text-dark-text mb-4">Account Settings</h2>
               <div className="space-y-3 flex-grow">
                <p className="text-dark-text/80">Update your account details.</p>
                <p><strong>Email:</strong> {user.email}</p>
              </div>
              <Link to="/dashboard/settings">
                <Button variant="outline" className="w-full mt-4">
                  <Icon id="cog" className="w-5 h-5 mr-2" />
                  Change Password
                </Button>
              </Link>
            </div>

          </div>
        </main>
      </div>
    </>
  );
};

export default DashboardView;
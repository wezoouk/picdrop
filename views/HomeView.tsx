
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { findUserByEmail } from '../services/weddingService';
import Spinner from '../components/Spinner';

const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gold-accent/10 text-center transition-transform hover:-translate-y-2">
      <div className="inline-block p-4 bg-gold-accent/10 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-serif font-bold text-dark-text mb-2">{title}</h3>
      <p className="text-dark-text/80 font-sans">{children}</p>
    </div>
);

const HomeView: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        const weddingData = await findUserByEmail(email);
        if(weddingData) {
            // In a real app, you'd check the password hash here.
            login({ 
                name: weddingData.details.coupleNames, 
                email: weddingData.details.ownerEmail!, 
                weddingId: weddingData.id 
            });
        } else {
            setError('No account found with this email address.');
        }
    } catch {
        setError('Failed to log in. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="bg-ivory text-dark-text">
      {/* Hero Section */}
      <main className="relative min-h-screen flex items-center justify-center p-4 text-center overflow-hidden">
         <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{backgroundImage: "url('https://picsum.photos/seed/weddingbg/1920/1080')"}}></div>
         <div className="absolute inset-0 bg-gradient-to-t from-ivory via-ivory/50 to-transparent"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight">
            Your Wedding Story, <span className="text-gold-accent">Beautifully Captured.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto font-sans text-dark-text/90">
            Create a private, stunning photo gallery that your guests will love. Effortlessly collect every precious moment from your special day, all in one place.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to="/signup">
              <Button variant="primary" size="lg">
                  Create Your Wedding Page
              </Button>
            </Link>
            <Link to="/example">
              <Button variant="outline" size="lg">
                  View Example Page
              </Button>
            </Link>
          </div>
           <p className="text-sm mt-3 text-dark-text/60">No sign up required to view example.</p>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-blush/50">
        <div className="container mx-auto text-center">
          <h2 className="font-serif text-4xl font-bold mb-2">One Place for Every Memory</h2>
          <p className="text-lg text-dark-text/80 mb-12 max-w-2xl mx-auto">PicDrop offers everything you need to create a seamless photo-sharing experience.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard icon={<Icon id="camera" className="w-8 h-8 text-gold-accent"/>} title="Easy Guest Uploads">
              Guests can upload photos and videos from any device in seconds. No app downloads required.
            </FeatureCard>
            <FeatureCard icon={<Icon id="gallery" className="w-8 h-8 text-gold-accent"/>} title="Live Gallery">
              See photos appear in a beautiful, real-time gallery during your event.
            </FeatureCard>
            <FeatureCard icon={<Icon id="lock-closed" className="w-8 h-8 text-gold-accent"/>} title="Private & Secure">
              Your page is your own. You control who sees your photos.
            </FeatureCard>
            <FeatureCard icon={<Icon id="sparkles" className="w-8 h-8 text-gold-accent"/>} title="Custom Page">
              Personalize your page with your names, wedding date, and a special message for your guests.
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
          <div className="container mx-auto text-center">
              <h2 className="font-serif text-4xl font-bold mb-12">Just Three Simple Steps</h2>
              <div className="flex flex-col md:flex-row justify-center items-center gap-12 md:gap-16">
                  <div className="flex items-center flex-col max-w-xs">
                      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gold-accent/10 border-2 border-gold-accent text-gold-accent font-serif text-3xl font-bold mb-4">1</div>
                      <h3 className="font-serif text-2xl font-bold mb-2">Create Your Page</h3>
                      <p className="text-dark-text/80">Personalize your unique wedding photo page in minutes.</p>
                  </div>
                   <div className="text-gold-accent/30 hidden md:block">&rarr;</div>
                  <div className="flex items-center flex-col max-w-xs">
                      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gold-accent/10 border-2 border-gold-accent text-gold-accent font-serif text-3xl font-bold mb-4">2</div>
                      <h3 className="font-serif text-2xl font-bold mb-2">Share The Link</h3>
                      <p className="text-dark-text/80">Share your page link with guests via QR code, text, or your wedding website.</p>
                  </div>
                   <div className="text-gold-accent/30 hidden md:block">&rarr;</div>
                  <div className="flex items-center flex-col max-w-xs">
                      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gold-accent/10 border-2 border-gold-accent text-gold-accent font-serif text-3xl font-bold mb-4">3</div>
                      <h3 className="font-serif text-2xl font-bold mb-2">Cherish Forever</h3>
                      <p className="text-dark-text/80">Watch the memories roll in and download all your favorite moments.</p>
                  </div>
              </div>
          </div>
      </section>
      
      {/* Login Section */}
      <section id="login" className="py-20 px-4 bg-blush/50">
        <div className="container mx-auto max-w-md">
            <div className="bg-ivory/80 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-gold-accent/10">
                <h2 className="text-3xl font-serif font-bold text-dark-text text-center">Welcome Back</h2>
                <p className="mt-2 text-center text-dark-text/80">Log in to manage your page.</p>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                  {error && <p className="text-red-500 text-sm text-center bg-red-100 p-3 rounded-md">{error}</p>}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="home-email-address" className="sr-only">Email address</label>
                            <input id="home-email-address" name="email" type="email" autoComplete="email" required className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gold-accent focus:border-gold-accent" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="home-password" className="sr-only">Password</label>
                            <input id="home-password" name="password" type="password" autoComplete="current-password" required className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gold-accent focus:border-gold-accent" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Spinner size="sm" color="border-white" /> : 'Log In'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
      </section>


      {/* Final CTA */}
      <section className="py-20 px-4 text-center">
        <div className="container mx-auto">
          <h2 className="font-serif text-4xl font-bold mb-4">Ready to Capture Your Story?</h2>
          <p className="text-lg text-dark-text/80 mb-8 max-w-2xl mx-auto">Start building your free wedding photo page today. It’s the perfect way to relive your special day for years to come.</p>
          <Link to="/signup">
            <Button variant="primary" size="lg">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-dark-text text-white py-8 px-4">
        <div className="container mx-auto text-center font-sans">
          <p>&copy; 2024 PicDrop. The best day ever, collected.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomeView;
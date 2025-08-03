
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import NavHeader from '../components/NavHeader';
import { useAuth } from '../contexts/AuthContext';
import { findUserByEmail } from '../services/weddingService';
import Spinner from '../components/Spinner';

const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // In a real app, you would verify email and password
    // against a backend. Here, we'll find the user in our DB by email.
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
    <>
      <NavHeader />
      <div className="min-h-[calc(100vh-4rem)] bg-blush/50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-ivory p-10 rounded-xl shadow-lg border border-gold-accent/20">
          <div>
            <h2 className="mt-6 text-center text-3xl font-serif font-bold text-dark-text">
              Log in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-dark-text/80">
              To manage your wedding page.
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div className="space-y-4">
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-dark-text">Email address</label>
                <input id="email-address" name="email" type="email" autoComplete="email" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gold-accent focus:border-gold-accent" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-dark-text">Password</label>
                <input id="password" name="password" type="password" autoComplete="current-password" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gold-accent focus:border-gold-accent" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Spinner size="sm" color="border-white" /> : 'Log In'}
              </Button>
            </div>
          </form>
          <div className="text-sm text-center">
            <Link to="/signup" className="font-medium text-gold-accent hover:text-gold-accent/80">
              Don't have an account? Sign up
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginView;
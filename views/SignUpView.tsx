
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Icon from '../components/Icon';
import NavHeader from '../components/NavHeader';
import { useAuth } from '../contexts/AuthContext';
import { createWedding } from '../services/weddingService';

const SignUpView: React.FC = () => {
  const { login } = useAuth();
  const [coupleNames, setCoupleNames] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');


  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupleNames || !email || !password) {
      setError('All fields are required.');
      return;
    }
    setError('');

    // Generate a weddingId from the couple's names
    const weddingId = coupleNames.toLowerCase().replace(/ & /g, '-').replace(/[^a-z0-9-]/g, '');

    try {
      // Create the wedding page data in our 'database'
      await createWedding(
        weddingId, 
        { coupleNames, date: "Set Your Date!", message: "Welcome to our wedding celebration! We would be honored if you'd share the moments you capture today." },
        email
      );
      
      // Log the user in
      login({ name: coupleNames, email: email, weddingId });

    } catch (err) {
       if (err instanceof Error) {
         setError(err.message);
       } else {
         setError('An unexpected error occurred.');
       }
    }
  };

  return (
    <>
      <NavHeader />
      <div className="min-h-[calc(100vh-4rem)] bg-blush/50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-ivory p-10 rounded-xl shadow-lg border border-gold-accent/20">
          <div>
            <h2 className="mt-6 text-center text-3xl font-serif font-bold text-dark-text">
              Create your wedding page
            </h2>
            <p className="mt-2 text-center text-sm text-dark-text/80">
              And start collecting memories.
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
             {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div className="space-y-4">
              <div>
                <label htmlFor="couple-names" className="block text-sm font-medium text-dark-text">Couple's Names</label>
                <input id="couple-names" name="names" type="text" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gold-accent focus:border-gold-accent" placeholder="e.g., Jessica & Michael" value={coupleNames} onChange={(e) => setCoupleNames(e.target.value)} />
              </div>
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-dark-text">Email address</label>
                <input id="email-address" name="email" type="email" autoComplete="email" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gold-accent focus:border-gold-accent" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-dark-text">Password</label>
                <input id="password" name="password" type="password" autoComplete="new-password" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gold-accent focus:border-gold-accent" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full" leftIcon={<Icon id='lock-closed' className="w-5 h-5" />}>
                Create Account
              </Button>
            </div>
          </form>
          <div className="text-sm text-center">
            <Link to="/login" className="font-medium text-gold-accent hover:text-gold-accent/80">
              Already have an account? Log in
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUpView;
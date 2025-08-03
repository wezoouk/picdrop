
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavHeader from '../components/NavHeader';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Spinner from '../components/Spinner';

const SettingsView: React.FC = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, you would call your backend here to update the password.
    // For this demo, we'll just show a success message.
    
    setIsSaving(false);
    setSuccess('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <>
      <NavHeader />
      <div className="bg-blush/50 min-h-[calc(100vh-4rem)] py-12">
        <div className="container mx-auto max-w-lg">
          <div className="bg-ivory p-8 rounded-xl shadow-lg border border-gold-accent/20">
            <h1 className="text-3xl font-serif font-bold text-dark-text mb-2">Account Settings</h1>
            <p className="text-dark-text/80 mb-6">Manage your account password.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-dark-text">Current Password</label>
                <input type="password" name="currentPassword" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gold-accent focus:border-gold-accent" required />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-dark-text">New Password</label>
                <input type="password" name="newPassword" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gold-accent focus:border-gold-accent" required />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-text">Confirm New Password</label>
                <input type="password" name="confirmPassword" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gold-accent focus:border-gold-accent" required />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}

              <div className="flex items-center justify-end gap-4 pt-4">
                 <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Spinner size="sm" color="border-white" /> : <Icon id="lock-closed" className="w-5 h-5" />}
                  {isSaving ? 'Saving...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsView;

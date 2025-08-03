import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './Button';
import Icon from './Icon';
import { useAuth } from '../contexts/AuthContext';

const NavHeader: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // The logout function in context will handle navigation
  };

  return (
    <header className="bg-ivory/80 backdrop-blur-sm sticky top-0 z-40 border-b border-gold-accent/20">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 text-xl font-serif font-bold text-dark-text hover:text-gold-accent transition-colors">
              <Icon id="camera" className="w-6 h-6 text-gold-accent" />
              PicDrop
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {user?.isAdmin && (
                  <Button variant="secondary" size="sm" onClick={() => navigate('/admin')}>
                    <Icon id="shield-check" className="w-5 h-5 mr-1"/>
                    Admin
                  </Button>
                )}
                {!user?.isAdmin && (
                  <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>Dashboard</Button>
                )}
                <Button variant="primary" size="sm" onClick={handleLogout}>Log Out</Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">Log In</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default NavHeader;
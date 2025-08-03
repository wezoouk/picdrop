
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomeView from './views/HomeView';
import WeddingHomeView from './views/WeddingHomeView';
import GuestView from './views/GuestView';
import GalleryView from './views/GalleryView';
import SignUpView from './views/SignUpView';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import ProtectedRoute from './components/ProtectedRoute';
import EditDetailsView from './views/EditDetailsView';
import ManagePhotosView from './views/ManagePhotosView';
import SettingsView from './views/SettingsView';
import AdminView from './views/AdminView';
import AdminProtectedRoute from './components/AdminProtectedRoute';


const App: React.FC = () => {
  return (
    <div className="bg-ivory font-sans text-dark-text min-h-screen">
      <HashRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/signup" element={<SignUpView />} />
            <Route path="/login" element={<LoginView />} />
            
            {/* Example wedding page */}
            <Route path="/example" element={<WeddingHomeView isExample />} />
            <Route path="/example/upload" element={<GuestView isExample />} />
            <Route path="/example/gallery" element={<GalleryView isExample />} />

            {/* Protected user dashboard routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardView /></ProtectedRoute>} />
            <Route path="/dashboard/edit" element={<ProtectedRoute><EditDetailsView /></ProtectedRoute>} />
            <Route path="/dashboard/photos" element={<ProtectedRoute><ManagePhotosView /></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsView /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminProtectedRoute><AdminView /></AdminProtectedRoute>} />
            <Route path="/admin/manage/:weddingId" element={<AdminProtectedRoute><ManagePhotosView /></AdminProtectedRoute>} />

            {/* Dynamic wedding page routes */}
            <Route path="/w/:weddingId" element={<WeddingHomeView />} />
            <Route path="/w/:weddingId/upload" element={<GuestView />} />
            <Route path="/w/:weddingId/gallery" element={<GalleryView />} />

          </Routes>
        </AuthProvider>
      </HashRouter>
    </div>
  );
};

export default App;
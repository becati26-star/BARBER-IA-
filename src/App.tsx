import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PackagesSection } from './components/PackagesSection';
import { StyleGallery } from './components/StyleGallery';
import { BarbersSection } from './components/BarbersSection';
import { FaceScannerModal } from './components/FaceScannerModal';
import { BookingModal } from './components/BookingModal';
import { AuthModal } from './components/AuthModal';
import { BarberDashboard } from './components/BarberDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { SecurityComplianceModal } from './components/SecurityComplianceModal';
import { Footer } from './components/Footer';

import { 
  UserRole, 
  ClientProfile, 
  BarberProfile, 
  BarberServicePackage 
} from './types';
import { storeService } from './services/store';

export default function App() {
  // Navigation & View state
  const [currentView, setCurrentView] = useState<'home' | 'barber-dashboard' | 'admin-dashboard'>('home');

  // Authenticated User State
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [activeClient, setActiveClient] = useState<ClientProfile | null>(null);
  const [activeBarber, setActiveBarber] = useState<BarberProfile | null>(null);

  // Modals state
  const [faceScannerOpen, setFaceScannerOpen] = useState<boolean>(false);
  const [faceScannerMode, setFaceScannerMode] = useState<'analysis' | 'auth'>('analysis');

  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [bookingPreselectedPackage, setBookingPreselectedPackage] = useState<BarberServicePackage | null>(null);
  const [bookingPreselectedBarber, setBookingPreselectedBarber] = useState<BarberProfile | null>(null);
  const [bookingPreselectedStyleName, setBookingPreselectedStyleName] = useState<string | null>(null);

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'client' | 'barber' | 'admin' | 'register'>('client');

  const [securityModalOpen, setSecurityModalOpen] = useState<boolean>(false);

  // Handlers
  const handleOpenFaceScanner = (mode: 'analysis' | 'auth') => {
    setFaceScannerMode(mode);
    setFaceScannerOpen(true);
  };

  const handleOpenBooking = (
    pkg?: BarberServicePackage | null,
    barber?: BarberProfile | null,
    styleName?: string | null
  ) => {
    setBookingPreselectedPackage(pkg || null);
    setBookingPreselectedBarber(barber || null);
    setBookingPreselectedStyleName(styleName || null);
    setBookingModalOpen(true);
  };

  const handleOpenAuth = (tab: 'client' | 'barber' | 'admin' | 'register' = 'client') => {
    setAuthModalInitialTab(tab);
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = (
    role: UserRole,
    client?: ClientProfile,
    barber?: BarberProfile
  ) => {
    setUserRole(role);
    if (role === 'client') {
      setActiveClient(client || storeService.getClients()[0]);
      setActiveBarber(null);
      setCurrentView('home');
    } else if (role === 'barber') {
      setActiveBarber(barber || storeService.getBarbers()[0]);
      setActiveClient(null);
      setCurrentView('barber-dashboard');
    } else if (role === 'admin') {
      setActiveClient(null);
      setActiveBarber(null);
      setCurrentView('admin-dashboard');
    }
  };

  const handleFaceAuthenticated = (client: ClientProfile) => {
    setUserRole('client');
    setActiveClient(client);
    setActiveBarber(null);
  };

  const handleLogout = () => {
    setUserRole(null);
    setActiveClient(null);
    setActiveBarber(null);
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen bg-[#05070d] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Sticky Main Navigation */}
      <Navbar
        userRole={userRole}
        activeClient={activeClient}
        activeBarber={activeBarber}
        onOpenFaceScanner={handleOpenFaceScanner}
        onOpenBooking={() => handleOpenBooking()}
        onOpenAuth={handleOpenAuth}
        onOpenSecurity={() => setSecurityModalOpen(true)}
        onLogout={handleLogout}
        currentView={currentView}
        onChangeView={setCurrentView}
      />

      {/* Main View Switching */}
      <main className="flex-1">
        {currentView === 'home' && (
          <>
            {/* Hero Section with logo & interactive CTAs */}
            <Hero
              onOpenFaceScanner={handleOpenFaceScanner}
              onOpenBooking={() => handleOpenBooking()}
              onOpenAuth={() => handleOpenAuth('client')}
            />

            {/* Packages Section */}
            <PackagesSection
              onSelectPackageForBooking={(pkg) => handleOpenBooking(pkg)}
              onOpenFaceScanner={() => handleOpenFaceScanner('analysis')}
            />

            {/* Personalized Style Gallery */}
            <StyleGallery
              activeClient={activeClient}
              onSelectStyleForBooking={(styleName) => handleOpenBooking(null, null, styleName)}
              onOpenFaceScanner={() => handleOpenFaceScanner('analysis')}
            />

            {/* Master Barbers Section */}
            <BarbersSection
              onSelectBarberForBooking={(barber) => handleOpenBooking(null, barber)}
              onOpenBarberLogin={() => handleOpenAuth('barber')}
            />
          </>
        )}

        {/* Barber Real-Time Shift Dashboard */}
        {currentView === 'barber-dashboard' && (
          <BarberDashboard
            barber={activeBarber || storeService.getBarbers()[0]}
            onBackToHome={() => setCurrentView('home')}
          />
        )}

        {/* Super Admin Control Panel */}
        {currentView === 'admin-dashboard' && (
          <AdminDashboard
            onBackToHome={() => setCurrentView('home')}
            onOpenSecurityModal={() => setSecurityModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenFaceScanner={() => handleOpenFaceScanner('analysis')}
        onOpenBooking={() => handleOpenBooking()}
        onOpenSecurity={() => setSecurityModalOpen(true)}
        onOpenAdminLogin={() => handleOpenAuth('admin')}
        onOpenBarberLogin={() => handleOpenAuth('barber')}
      />

      {/* Interactive Modal 1: Face Scanner (Style Analysis & Face ID) */}
      <FaceScannerModal
        isOpen={faceScannerOpen}
        onClose={() => setFaceScannerOpen(false)}
        mode={faceScannerMode}
        onStyleSelectedForBooking={(styleName, pkgId) => {
          const pkg = pkgId ? storeService.getClients() && undefined : undefined;
          handleOpenBooking(pkg, null, styleName);
        }}
        onFaceAuthenticated={handleFaceAuthenticated}
      />

      {/* Interactive Modal 2: Multi-step Booking & Payment Engine */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preselectedPackage={bookingPreselectedPackage}
        preselectedBarber={bookingPreselectedBarber}
        preselectedStyleName={bookingPreselectedStyleName}
        activeClient={activeClient}
      />

      {/* Interactive Modal 3: Unified Multi-role Auth & Password Recovery */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalInitialTab}
        onLoginSuccess={handleLoginSuccess}
        onOpenFaceIDScanner={() => handleOpenFaceScanner('auth')}
      />

      {/* Interactive Modal 4: ISO 27001 / OWASP / ISO 42010 Compliance Center */}
      <SecurityComplianceModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
      />

    </div>
  );
}

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PackagesSection } from './components/PackagesSection';
import { StyleGallery } from './components/StyleGallery';
import { ProductsSection } from './components/ProductsSection';
import { BarbersSection } from './components/BarbersSection';
import { FaceScannerModal } from './components/FaceScannerModal';
import { BookingModal } from './components/BookingModal';
import { CartModal } from './components/CartModal';
import { AuthModal } from './components/AuthModal';
import { BarberDashboard } from './components/BarberDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { SecurityComplianceModal } from './components/SecurityComplianceModal';
import { Footer } from './components/Footer';

import { 
  UserRole, 
  ClientProfile, 
  BarberProfile, 
  BarberServicePackage,
  CurrencyCode
} from './types';
import { INITIAL_PACKAGES, storeService } from './services/store';

export default function App() {
  // Navigation & View state
  const [currentView, setCurrentView] = useState<'home' | 'barber-dashboard' | 'admin-dashboard'>('home');

  // Authenticated User State
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [activeClient, setActiveClient] = useState<ClientProfile | null>(null);
  const [activeBarber, setActiveBarber] = useState<BarberProfile | null>(null);

  // Persistent Store & Currency State
  const [cartCount, setCartCount] = useState<number>(() => storeService.getCartCount());
  const [cartModalOpen, setCartModalOpen] = useState<boolean>(false);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('BOB');

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

  const refreshCartCount = () => {
    setCartCount(storeService.getCartCount());
  };

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

  const handleSaveFaceProfile = (updatedClient: ClientProfile) => {
    setActiveClient(updatedClient);
    if (!userRole) {
      setUserRole('client');
    }
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
        cartCount={cartCount}
        onOpenCart={() => setCartModalOpen(true)}
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
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

            {/* Personalized Style Gallery & Technical Encyclopedia */}
            <StyleGallery
              activeClient={activeClient}
              onSelectStyleForBooking={(styleName) => handleOpenBooking(null, null, styleName)}
              onOpenFaceScanner={() => handleOpenFaceScanner('analysis')}
            />

            {/* Barbershop Products Store in Bolivianos (Bs) + Currency Converter */}
            <ProductsSection
              onOpenCart={() => setCartModalOpen(true)}
              cartCount={cartCount}
              selectedCurrency={selectedCurrency}
              onCurrencyChange={setSelectedCurrency}
              onCartUpdated={refreshCartCount}
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

      {/* Interactive Modal 1: Face Scanner (Style Analysis, Virtual Try-On & Face ID) */}
      <FaceScannerModal
        isOpen={faceScannerOpen}
        onClose={() => setFaceScannerOpen(false)}
        mode={faceScannerMode}
        activeClient={activeClient}
        onStyleSelectedForBooking={(styleName, pkgId) => {
          const pkg = pkgId ? INITIAL_PACKAGES.find(p => p.id === pkgId) || null : null;
          handleOpenBooking(pkg, null, styleName);
        }}
        onFaceAuthenticated={handleFaceAuthenticated}
        onSaveFaceProfile={handleSaveFaceProfile}
      />

      {/* Interactive Modal 2: Multi-step Booking & QR/Card Payment Engine */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preselectedPackage={bookingPreselectedPackage}
        preselectedBarber={bookingPreselectedBarber}
        preselectedStyleName={bookingPreselectedStyleName}
        activeClient={activeClient}
      />

      {/* Interactive Modal 3: Persistent Shopping Cart, Currency Converter & QR Payment */}
      <CartModal
        isOpen={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        activeClient={activeClient}
        onCartUpdated={refreshCartCount}
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
      />

      {/* Interactive Modal 4: Unified Multi-role Auth & Password Recovery */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalInitialTab}
        onLoginSuccess={handleLoginSuccess}
        onOpenFaceIDScanner={() => handleOpenFaceScanner('auth')}
      />

      {/* Interactive Modal 5: ISO 27001 / OWASP / ISO 42010 Compliance Center */}
      <SecurityComplianceModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
      />

    </div>
  );
}

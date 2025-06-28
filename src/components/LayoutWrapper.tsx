'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} />
      <div className="flex-1 md:ml-64 bg-gray-50">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          toggleMobileMenu={toggleMobileMenu}
        />
        <main className="p-4 sm:p-6 lg:p-8 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}

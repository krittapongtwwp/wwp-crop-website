import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AIAssistant } from './AIAssistant';
import { CookieConsent } from './CookieConsent';
import { ChangelogNotification } from './ChangelogNotification';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden transition-colors duration-300">
      <Navbar />
      <main className="flex-grow pt-24">
        <Outlet />
      </main>
      <Footer />
      <AIAssistant />
      <CookieConsent />
    </div>
  );
}

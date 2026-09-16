'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const TRANSLATIONS = {
  en: {
    brandName: 'PlumberIndore',
    tagline: 'Doorstep Experts',
    navHome: 'Home',
    navServices: 'Services',
    navHowItWorks: 'How It Works',
    navAbout: 'About',
    navBlog: 'Blog',
    navContact: 'Contact',
    bookNow: 'Book Now',
    callHelpline: 'Call Helpline',
    costEstimator: 'Cost Estimator',
    heroTitle: 'Indore’s #1 Doorstep Plumbing & Appliance Repair',
    heroSubtitle: 'Certified technicians reach your home promptly across Vijay Nagar, Palasia, Bhanwarkuan & all Indore sectors.',
    guarantee: '30-Day Post Service Warranty',
    selectService: 'Select Service',
    viewDetails: 'View Details',
    allServices: 'All Plumbing & Appliance Services',
    checkPincode: 'Check Indore Pincode',
    searchPlaceholder: 'Search AC, Plumber, RO...',
  },
  hi: {
    brandName: 'प्लम्बर इंदौर',
    tagline: 'घर पहुंच विशेषज्ञ',
    navHome: 'होम',
    navServices: 'सेवाएं',
    navHowItWorks: 'कार्य प्रणाली',
    navAbout: 'हमारे बारे में',
    navBlog: 'ब्लॉग',
    navContact: 'संपर्क करें',
    bookNow: 'अभी बुक करें',
    callHelpline: 'कॉल हेल्पलाइन',
    costEstimator: 'खर्च कैलकुलेटर',
    heroTitle: 'इंदौर की नं.1 प्लंबिंग और होम एप्लायंस रिपेयर सेवा',
    heroSubtitle: 'विजय नगर, पलासिया, भंवरकुआं और इंदौर के सभी क्षेत्रों में certified टेक्नीशियन 45 मिनट में आपके घर पहुंचेंगे।',
    guarantee: '30 दिनों की वारंटी',
    selectService: 'सेवा चुनें',
    viewDetails: 'विवरण देखें',
    allServices: 'सभी प्लंबिंग और एप्लायंस सेवाएं',
    checkPincode: 'इंदौर पिनकोड जांचें',
    searchPlaceholder: 'एसी, प्लंबर, आरओ खोजें...',
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('plumberindore_lang');
    if (saved === 'hi' || saved === 'en') {
      setLang(saved);
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'hi' : 'en';
    setLang(nextLang);
    try {
      localStorage.setItem('plumberindore_lang', nextLang);
    } catch (e) {}
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

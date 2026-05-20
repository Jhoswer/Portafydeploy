import { useEffect } from 'react';
import Navbar from '../../components/landing/Navbar';
import Hero from '../../components/landing/Hero';
import HowItWorks from '../../components/landing/HowItWorks';
import Features from '../../components/landing/Features';
import CtaSection from '../../components/landing/CtaSection';
import Footer from '../../components/landing/Footer';


export default function Home() {
  useEffect(() => {
    const handler = () => {
      document.querySelectorAll('.notif-dropdown.open').forEach((el) =>
        el.classList.remove('open')
      );
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <div className="portafy-home">
      <Navbar />
      <main style={{ paddingTop: '0' }}>
        <Hero />
        <HowItWorks />
        <Features />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}

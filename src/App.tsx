import Navbar from './components/Navbar';
import Hero from './components/Hero';
import EncodePanel from './components/EncodePanel';
import DecodePanel from './components/DecodePanel';
import SecurityInfo from './components/SecurityInfo';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import ToastContainer from './components/Toast';
import { useToast } from './hooks/useToast';

function Divider() {
  return (
    <div className="flex w-full max-w-2xl items-center gap-4 mx-auto px-4 py-2">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#00ff9f20]" />
      <span className="text-[#00ff9f30] text-xs tracking-widest">◆</span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#00ff9f20]" />
    </div>
  );
}

export default function App() {
  const { toasts, addToast, removeToast } = useToast();

  return (
    <div className="min-h-screen bg-[#0a0a0f] cyber-grid">
      <Navbar />

      <main className="flex w-full flex-col items-center gap-20 overflow-hidden pb-16">
        <Hero />
        <EncodePanel addToast={addToast} />
        <Divider />
        <DecodePanel addToast={addToast} />
        <SecurityInfo />
        <FAQ />
        <Footer />
      </main>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

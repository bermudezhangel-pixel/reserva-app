"use client";
import { useRouter } from 'next/navigation';

export default function BackButton({ route }: { route?: string }) {
  const router = useRouter();
  
  const handleBack = () => {
    if (route) {
      router.push(route);
    } else {
      router.back();
    }
  };

  return (
    <button 
      onClick={handleBack} 
      className="fixed top-6 left-6 z-50 bg-white/10 backdrop-blur-md border border-current text-[var(--text-main)] p-3 rounded-full shadow-lg hover:scale-110 hover:bg-[var(--color-primary)] hover:text-white hover:border-transparent transition-all duration-300 group"
      title="Volver"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
    </button>
  );
}
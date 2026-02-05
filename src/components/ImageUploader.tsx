"use client";
import { useState } from 'react';

export default function ImageUploader({ onImagesChange, existingImages = [] }: any) {
  const [images, setImages] = useState<string[]>(existingImages);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => {
            const newImgs = [...prev, reader.result as string];
            onImagesChange(newImgs); // Notificar al padre
            return newImgs;
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    const newImgs = images.filter((_, i) => i !== index);
    setImages(newImgs);
    onImagesChange(newImgs);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {images.map((img, idx) => (
          <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden shadow-md group">
            <img src={img} alt="preview" className="w-full h-full object-cover" />
            <button 
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center font-bold transition-opacity"
            >
              ✕
            </button>
          </div>
        ))}
        
        <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors">
          <span className="text-2xl">+</span>
          <span className="text-[9px] font-bold uppercase">Agregar</span>
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
      </div>
      <p className="text-[10px] opacity-50">Soporta múltiples imágenes (Máx recomendado 5MB total)</p>
    </div>
  );
}
"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'colorful';
type Lang = 'es' | 'en';

interface ThemeColors {
  primary: string;
  background: string;
  card: string;
  text: string; // Nuevo: Color de fuente
}

// Configuración inicial de colores
const defaultPalettes: Record<Theme, ThemeColors> = {
  light: { primary: '#2563eb', background: '#f8fafc', card: '#ffffff', text: '#0f172a' },
  dark: { primary: '#3b82f6', background: '#0f172a', card: '#1e293b', text: '#f8fafc' },
  colorful: { primary: '#db2777', background: '#4c1d95', card: '#ffffff20', text: '#ffffff' }
};

// Diccionario de Traducciones
const translations = {
  es: {
    dashboard: "Panel de Control",
    reservations: "Reservas",
    inventory: "Inventario",
    users: "Usuarios",
    design: "Diseño",
    create: "Crear Nuevo",
    edit: "Editar",
    delete: "Borrar",
    save: "Guardar",
    cancel: "Cancelar",
    active: "Activo",
    activate: "Activar",
    primaryColor: "Color Primario",
    bgColor: "Fondo Pantalla",
    textColor: "Color Texto",
    cardColor: "Fondo Tarjetas",
    appIdentity: "Identidad de la App",
    logoDesc: "Sube el logo corporativo.",
    titles: "Títulos y Textos",
    titleLabel: "Título Principal",
    subtitleLabel: "Subtítulo",
    manage: "Gestionar",
    name: "Nombre",
    desc: "Descripción",
    price: "Precio",
    cap: "Capacidad",
    equip: "Equipamiento",
    role: "Rol",
    status: "Estado",
    phone: "Teléfono",
    email: "Email"
  },
  en: {
    dashboard: "Dashboard",
    reservations: "Reservations",
    inventory: "Inventory",
    users: "Users",
    design: "Design",
    create: "Create New",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    active: "Active",
    activate: "Activate",
    primaryColor: "Primary Color",
    bgColor: "Background",
    textColor: "Text Color",
    cardColor: "Card Background",
    appIdentity: "App Identity",
    logoDesc: "Upload corporate logo.",
    titles: "Titles & Texts",
    titleLabel: "Main Title",
    subtitleLabel: "Subtitle",
    manage: "Manage",
    name: "Name",
    desc: "Description",
    price: "Price",
    cap: "Capacity",
    equip: "Equipment",
    role: "Role",
    status: "Status",
    phone: "Phone",
    email: "Email"
  }
};

const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [lang, setLang] = useState<Lang>('es');
  const [logo, setLogo] = useState<string | null>(null);
  
  // Textos Editables
  const [appTitle, setAppTitle] = useState("Admin Panel");
  const [appSubtitle, setAppSubtitle] = useState("Gestión Global");

  const [customPalettes, setCustomPalettes] = useState<Record<Theme, ThemeColors>>(defaultPalettes);

  useEffect(() => {
    // Cargar persistencia
    const sTheme = localStorage.getItem('app-theme') as Theme;
    const sLang = localStorage.getItem('app-lang') as Lang;
    const sLogo = localStorage.getItem('app-logo');
    const sTitle = localStorage.getItem('app-title');
    const sSub = localStorage.getItem('app-sub');
    const sColors = localStorage.getItem('app-colors');

    if (sTheme) setTheme(sTheme);
    if (sLang) setLang(sLang);
    if (sLogo) setLogo(sLogo);
    if (sTitle) setAppTitle(sTitle);
    if (sSub) setAppSubtitle(sSub);
    if (sColors) setCustomPalettes(JSON.parse(sColors));
  }, []);

  // Inyectar variables CSS
  useEffect(() => {
    const root = document.documentElement;
    const colors = customPalettes[theme];
    root.style.setProperty('--bg-primary', colors.background);
    root.style.setProperty('--bg-card', colors.card);
    root.style.setProperty('--text-main', colors.text);
    root.style.setProperty('--color-primary', colors.primary);
  }, [theme, customPalettes]);

  // Updaters
  const changeTheme = (t: Theme) => { setTheme(t); localStorage.setItem('app-theme', t); };
  const changeLang = (l: Lang) => { setLang(l); localStorage.setItem('app-lang', l); };
  
  const updateAppTexts = (title: string, sub: string) => {
    setAppTitle(title);
    setAppSubtitle(sub);
    localStorage.setItem('app-title', title);
    localStorage.setItem('app-sub', sub);
  };

  const updateLogo = (newLogo: string) => {
    setLogo(newLogo);
    localStorage.setItem('app-logo', newLogo);
  };

  const updatePaletteColor = (themeName: Theme, colorKey: keyof ThemeColors, value: string) => {
    const newPalettes = {
      ...customPalettes,
      [themeName]: { ...customPalettes[themeName], [colorKey]: value }
    };
    setCustomPalettes(newPalettes);
    localStorage.setItem('app-colors', JSON.stringify(newPalettes));
  };

  // Exponemos el diccionario traducido según el idioma actual
  const t = translations[lang];

  return (
    <ThemeContext.Provider value={{ 
      theme, lang, logo, appTitle, appSubtitle, t, // Variables
      changeTheme, changeLang, updateLogo, updateAppTexts, updatePaletteColor, customPalettes // Funciones
    }}>
      <div className="min-h-screen transition-colors duration-700 ease-in-out font-sans" 
           style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
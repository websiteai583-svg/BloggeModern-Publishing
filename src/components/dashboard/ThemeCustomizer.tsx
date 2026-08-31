import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { initialThemes } from '../../data/initialData';
import { ThemeConfig } from '../../types';
import { 
  Palette, 
  Check, 
  Code, 
  Save, 
  Sparkles, 
  Sliders, 
  Eye, 
  Type, 
  Layers
} from 'lucide-react';

export const ThemeCustomizer: React.FC = () => {
  const { currentTheme, setCurrentTheme, themes, language, t, showToast } = useApp();

  const themeList = Array.isArray(themes) && themes.length > 0 ? themes : initialThemes;

  const [primaryColor, setPrimaryColor] = useState(currentTheme?.primaryColor || '#6366f1');
  const [fontFamily, setFontFamily] = useState(currentTheme?.fontFamilyHeading || 'Hind Siliguri');
  const [borderRadius, setBorderRadius] = useState(currentTheme?.borderRadius || '1rem');
  const [customCss, setCustomCss] = useState(currentTheme?.customCss || '/* Custom CSS for Blogge */\n.blog-card {\n  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n}');
  const [activeTab, setActiveTab] = useState<'themes' | 'custom-css' | 'scripts'>('themes');

  useEffect(() => {
    if (currentTheme) {
      setPrimaryColor(currentTheme.primaryColor || '#6366f1');
      setFontFamily(currentTheme.fontFamilyHeading || 'Hind Siliguri');
      setBorderRadius(currentTheme.borderRadius || '1rem');
      if (currentTheme.customCss !== undefined) {
        setCustomCss(currentTheme.customCss);
      }
    }
  }, [currentTheme]);

  const handleApplyTheme = (theme: ThemeConfig) => {
    setCurrentTheme(theme);
    setPrimaryColor(theme.primaryColor);
    setFontFamily(theme.fontFamilyHeading || 'Hind Siliguri');
    setBorderRadius(theme.borderRadius);
    showToast(language === 'bn' ? `"${theme.name}" থিমটি সক্রিয় করা হয়েছে!` : `Theme "${theme.name}" applied!`);
  };

  const handleSaveCustomizations = () => {
    if (!currentTheme) return;
    setCurrentTheme({
      ...currentTheme,
      primaryColor,
      fontFamily,
      borderRadius,
      customCss
    });
    showToast(language === 'bn' ? 'থিম কাস্টমাইজেশন সংরক্ষিত হয়েছে!' : 'Theme customizations saved!');
  };

  return (
    <div id="theme-customizer-view" className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {t('theme')}
            </h1>
            <span className="ai-pill">Styling Hub</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'bn' ? 'ব্লগের ভিজ্যুয়াল থিম, কালার ও কাস্টম সিএসএস এডিটর' : 'Visual themes, color branding, typography, and custom CSS code'}
          </p>
        </div>

        <button
          onClick={handleSaveCustomizations}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/25 transition"
        >
          <Save className="w-4 h-4" />
          <span>{t('saveSettings')}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('themes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'themes' 
              ? 'bg-orange-500 text-white shadow-md' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {language === 'bn' ? 'থিম স্টোর (Theme Gallery)' : 'Theme Gallery'}
        </button>
        <button
          onClick={() => setActiveTab('custom-css')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'custom-css' 
              ? 'bg-orange-500 text-white shadow-md' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {language === 'bn' ? 'কাস্টম সিএসএস (CSS Editor)' : 'Custom CSS Editor'}
        </button>
      </div>

      {activeTab === 'themes' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themeList.map((theme) => {
            const isSelected = currentTheme?.id === theme.id;
            return (
              <div
                key={theme.id}
                id={`theme-card-${theme.id}`}
                className={`relative bg-white dark:bg-slate-900 rounded-3xl border-2 overflow-hidden flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-orange-500 shadow-xl shadow-orange-500/10 scale-[1.02]'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Theme Preview Visual Image */}
                <div className="relative aspect-video overflow-hidden bg-slate-900">
                  <img
                    src={theme.previewImage}
                    alt={theme.name}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-orange-500 text-white font-bold text-[10px] uppercase rounded-full shadow-lg flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Active Theme</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {theme.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {theme.description}
                    </p>

                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Type className="w-3.5 h-3.5 text-orange-500" />
                        {theme.fontFamilyHeading || 'Hind Siliguri'}
                      </span>
                      •
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: theme.primaryColor }} />
                        Brand Color
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleApplyTheme(theme)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-orange-500 hover:text-white'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{t('applied')}</span>
                        </>
                      ) : (
                        <span>{t('applyTheme')}</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Custom CSS Editor Canvas */
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-orange-500" />
              <span>{language === 'bn' ? 'কাস্টম সিএসএস কোড ইনজেক্টর' : 'Live Custom CSS Injector'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">এখানে আপনার নিজস্ব সিএসএস ক্লাস ও স্টাইল লিখুন। লাইভ ব্লগে সরাসরি প্রযোজ্য হবে।</p>
          </div>

          <textarea
            rows={14}
            value={customCss}
            onChange={(e) => setCustomCss(e.target.value)}
            className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-900 text-emerald-400 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      )}

    </div>
  );
};

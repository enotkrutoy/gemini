
import React, { useState, useRef, useEffect } from 'react';
import { GenerationResult, HairstyleConfig, LoadingState, Gender } from '../types';
import { generateHairstyle, enhanceImage } from '../services/geminiService';
import { ImageIcon, UploadIcon, SparklesIcon, TrashIcon, DownloadIcon, ZoomInIcon, XIcon, HeartIcon, ShareIcon } from './ui/Icons';

interface HairstyleStudioProps {
  onBack: () => void;
}

// Data options in Russian - UPDATED
const HAIRSTYLES = [
  "Каскад",
  "Удлинённое каре (Лоб)",
  "Боб-каре",
  "Кудрявое каре",
  "Асимметрия",
  "Пикси",
  "Пляжные локоны",
  "Длинные волнистые",
  "Прямые с чёлкой",
  "Шторки (Curtain Bangs)",
  "Волф кат (Wolf Cut)",
  "Афрокосички (Box Braids)",
  "Косы (Cornrows)",
  "Дреды",
  "Дреды (Короткие)",
  "Кудрявое афро",
  "Афро",
  "Небрежный пучок",
  "Гладкий пучок",
  "Высокий хвост",
  "Два пучка (Space Buns)",
  "Коса 'Колосок'",
  "Коса 'Рыбий хвост'",
  "Косы",
  "Маллет",
  "Шегги",
  "Кроп (Цезарь)",
  "Андеркат",
  "Андеркат с узором",
  "Зачёс назад",
  "Помпадур",
  "Фейд (Fade)",
  "Ирокез",
  "Стрижка 'Горшок'",
  "Топ Кнот (Man Bun)",
  "Гарсон",
  "Базз кат (Стрижка под машинку)",
  "Налысо",
  "Химическая завивка",
  "Боковой пробор"
];

const COLORS = [
  { name: "Чёрный", hex: "#1A1A1A" },
  { name: "Каштановый", hex: "#4A3728" },
  { name: "Блонд", hex: "#E6C288" },
  { name: "Платиновый", hex: "#F0F0F0" },
  { name: "Рыжий", hex: "#8D2B2B" },
  { name: "Пепельный", hex: "#C0C0C0" },
  { name: "Розовый", hex: "#FF69B4" },
  { name: "Синий", hex: "#4169E1" },
  { name: "Зелёный", hex: "#00FA9A" },
];

const HairstyleStudio: React.FC<HairstyleStudioProps> = ({ onBack }) => {
  // State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [config, setConfig] = useState<HairstyleConfig>({
    gender: 'Не указано',
    style: HAIRSTYLES[0],
    color: COLORS[0].name,
    volume: 'medium', // Default volume
    prompt: '',
    resolution: '1k'
  });
  const [history, setHistory] = useState<GenerationResult[]>([]);
  const [favorites, setFavorites] = useState<GenerationResult[]>([]);
  const [activeTab, setActiveTab] = useState<'history' | 'favorites'>('history');
  
  const [loading, setLoading] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [autoEnhance, setAutoEnhance] = useState(false); // Auto enhance toggle
  
  // Progress State for "Smart Loading"
  const [progressStep, setProgressStep] = useState<string>('');
  
  // Modal State - Stores the specific result being viewed
  const [selectedResult, setSelectedResult] = useState<GenerationResult | null>(null);
  
  // Compare Slider State (Only for Modal now)
  const [compareSlider, setCompareSlider] = useState(50);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsEndRef = useRef<HTMLDivElement>(null);
  
  // Touch handling for slider in modal
  const sliderRef = useRef<HTMLDivElement>(null);

  // Load favorites from local storage
  useEffect(() => {
    const savedFavs = localStorage.getItem('astoria_favorites');
    if (savedFavs) {
        try {
            setFavorites(JSON.parse(savedFavs));
        } catch (e) {
            console.error("Failed to parse favorites", e);
        }
    }
  }, []);

  // Save favorites to local storage whenever they change
  useEffect(() => {
      if (favorites.length > 0) {
        try {
             // Basic quota protection (local storage is small)
             // In a real app, use IndexedDB or backend
            localStorage.setItem('astoria_favorites', JSON.stringify(favorites));
        } catch (e) {
            console.error("Storage quota exceeded", e);
            setError("Лимит избранного исчерпан. Удалите старые записи.");
        }
      } else {
          localStorage.removeItem('astoria_favorites');
      }
  }, [favorites]);

  // Auto scroll to results
  useEffect(() => {
    if (loading === 'idle' && history.length > 0 && activeTab === 'history' && resultsEndRef.current) {
        resultsEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [loading, history.length, activeTab]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedImage) return;
    
    setError(null);
    setActiveTab('history'); // Switch to history view on generate
    let sourceImage = uploadedImage;

    try {
        // Step 1: Auto Enhance (Optional)
        if (autoEnhance) {
            setLoading('enhancing');
            setProgressStep('Анализ и реставрация...');
            try {
                sourceImage = await enhanceImage(uploadedImage);
                setProgressStep('Реставрация завершена');
            } catch (e) {
                console.warn("Auto-enhance failed, proceeding with original image.", e);
            }
        }

        // Step 2: Generate Hairstyle
        setLoading('generating');
        
        // Simulate visual steps for UX
        const steps = [
            "Сканирование геометрии лица...",
            "Подбор текстуры волос...",
            "Моделирование объема...",
            "Финальный рендеринг..."
        ];
        
        let stepIdx = 0;
        const interval = setInterval(() => {
            if (stepIdx < steps.length) {
                setProgressStep(steps[stepIdx]);
                stepIdx++;
            }
        }, 1500);

        const { generated: resultImage, original: processedOriginal } = await generateHairstyle(sourceImage, config);
        
        clearInterval(interval);
        
        const newResult: GenerationResult = {
            id: crypto.randomUUID(),
            originalImage: processedOriginal, // Use the processed version for perfect alignment
            generatedImage: resultImage,
            config: { ...config },
            timestamp: Date.now()
        };
        
        setHistory(prev => [newResult, ...prev]);

    } catch (err: any) {
        setError(err.message || "Ошибка генерации.");
    } finally {
        setLoading('idle');
        setProgressStep('');
    }
  };

  const handleDownload = async (imageBase64: string, prefix: string) => {
    try {
      const res = await fetch(imageBase64);
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${prefix}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("Download failed:", err);
      setError("Не удалось скачать изображение.");
    }
  };

  const handleShare = async (imageBase64: string) => {
    try {
        const res = await fetch(imageBase64);
        const blob = await res.blob();
        const file = new File([blob], `astoria-style-${Date.now()}.png`, { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Мой новый образ от Astoria AI',
                text: 'Смотри, как я выгляжу с новой причёской!',
            });
        } else {
            // Fallback for desktop if share not available
            handleDownload(imageBase64, 'astoria-share');
            setError("Шеринг не поддерживается на этом устройстве, начато скачивание.");
            setTimeout(() => setError(null), 3000);
        }
    } catch (err) {
        console.error("Share failed", err);
    }
  };

  const toggleFavorite = (result: GenerationResult, e: React.MouseEvent) => {
      e.stopPropagation();
      const exists = favorites.find(f => f.id === result.id);
      
      if (exists) {
          setFavorites(prev => prev.filter(f => f.id !== result.id));
      } else {
          setFavorites(prev => [result, ...prev]);
      }
  };

  const clearHistory = () => {
    if (activeTab === 'history') {
        setHistory([]);
    } else {
        if (window.confirm("Удалить все избранные образы?")) {
            setFavorites([]);
        }
    }
  };

  const handleSliderMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    // Calculate slider position relative to the image container
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    const percentage = (x / rect.width) * 100;
    setCompareSlider(percentage);
  };

  const displayedResults = activeTab === 'history' ? history : favorites;

  return (
    <div className="h-[100dvh] w-full flex flex-col md:flex-row font-sans overflow-hidden bg-dark-bg text-white">
      {/* Sidebar: Controls - Fixed height on mobile, full height on desktop */}
      <div className="w-full md:w-[380px] bg-dark-surface border-r border-white/10 flex flex-col h-[45dvh] md:h-full z-20 shadow-2xl flex-shrink-0">
        
        {/* Header - Fixed */}
        <div className="p-4 bg-dark-card border-b border-white/10 flex items-center justify-between flex-shrink-0">
           <div className="flex items-center gap-3">
               <div className="flex -space-x-2 overflow-hidden">
                   <div className="w-8 h-8 rounded-full bg-neon-purple border-2 border-dark-card flex items-center justify-center text-[10px] font-bold text-white">A</div>
                   <div className="w-8 h-8 rounded-full bg-black border-2 border-dark-card flex items-center justify-center text-[10px] font-bold text-white">AI</div>
               </div>
               <span className="text-sm font-display font-bold tracking-widest text-white">ASTORIA AI</span>
           </div>
           <button onClick={onBack} className="text-gray-400 hover:text-white p-2">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l5 5"/><path d="M4 4l5 5"/></svg>
           </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-5 overscroll-contain">
            <div className="flex justify-between items-center">
                 <div>
                    <h2 className="text-lg font-medium font-display text-white">Фильтр ИИ-стрижки</h2>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Настройка образа</p>
                 </div>
                 {/* Clear Button for Mobile UX */}
                 {uploadedImage && (
                     <button onClick={() => setUploadedImage(null)} className="text-xs text-red-400 hover:text-red-300">Сброс</button>
                 )}
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Upload Section */}
            <div 
                onClick={() => !uploadedImage && fileInputRef.current?.click()}
                className={`border border-dashed rounded-xl transition-all relative group overflow-hidden
                ${uploadedImage ? 'border-neon-purple/50 p-0' : 'border-white/10 bg-dark-input hover:border-white/30 p-6 text-center cursor-pointer'}`}
            >
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                {uploadedImage ? (
                <div className="relative w-full h-32 md:h-48 group">
                    <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover" />
                    <button 
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                    >
                        <span className="text-xs font-bold text-white bg-black/50 px-3 py-1 rounded-full border border-white/20">Изменить</span>
                    </button>
                </div>
                ) : (
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <UploadIcon className="text-gray-400 w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-300">Загрузить фото</p>
                    </div>
                </div>
                )}
            </div>

            {/* Auto Enhance Toggle */}
            <div className="flex items-center justify-between bg-dark-input p-3 rounded-lg border border-white/5">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${autoEnhance ? 'bg-neon-purple/20 text-neon-purple' : 'bg-white/5 text-gray-500'}`}>
                        <SparklesIcon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-200 font-medium">Авто-улучшение</span>
                        <span className="text-[10px] text-gray-500">HD Реставрация</span>
                    </div>
                </div>
                <button 
                    onClick={() => setAutoEnhance(!autoEnhance)} 
                    className={`w-10 h-6 rounded-full relative transition-colors duration-300 ${autoEnhance ? 'bg-neon-purple' : 'bg-gray-700'}`}
                >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${autoEnhance ? 'left-5' : 'left-1'}`}></span>
                </button>
            </div>

            {/* Settings Grid */}
            <div className="space-y-4">
                
                {/* VOLUME CONTROL (Prominent position) */}
                <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-2 tracking-wider flex items-center gap-2">
                        Объем волос <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white">New</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2 bg-dark-input p-1 rounded-lg border border-white/5">
                        <button
                            onClick={() => setConfig(prev => ({ ...prev, volume: 'natural' }))}
                            className={`py-2 px-1 text-xs font-medium rounded-md transition-all ${config.volume === 'natural' ? 'bg-white text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
                        >
                            Обычный
                        </button>
                        <button
                            onClick={() => setConfig(prev => ({ ...prev, volume: 'medium' }))}
                            className={`py-2 px-1 text-xs font-medium rounded-md transition-all ${config.volume === 'medium' ? 'bg-white text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
                        >
                            Средний
                        </button>
                        <button
                            onClick={() => setConfig(prev => ({ ...prev, volume: 'high' }))}
                            className={`py-2 px-1 text-xs font-medium rounded-md transition-all ${config.volume === 'high' ? 'bg-white text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
                        >
                            Пышный
                        </button>
                    </div>
                </div>

                {/* Style */}
                <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1.5 tracking-wider">Стиль прически</label>
                    <select 
                        value={config.style}
                        onChange={(e) => setConfig(prev => ({ ...prev, style: e.target.value }))}
                        className="w-full bg-dark-input border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-neon-purple appearance-none"
                    >
                        {HAIRSTYLES.map(style => (
                            <option key={style} value={style}>{style}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {/* Color */}
                    <div className="col-span-1">
                        <label className="block text-xs font-semibold uppercase text-gray-500 mb-1.5 tracking-wider">Цвет</label>
                        <select 
                            value={config.color}
                            onChange={(e) => setConfig(prev => ({ ...prev, color: e.target.value }))}
                            className="w-full bg-dark-input border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-neon-purple appearance-none"
                        >
                            {COLORS.map(c => (
                                <option key={c.name} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Gender */}
                    <div className="col-span-1">
                        <label className="block text-xs font-semibold uppercase text-gray-500 mb-1.5 tracking-wider">Пол</label>
                        <select 
                            value={config.gender}
                            onChange={(e) => setConfig(prev => ({ ...prev, gender: e.target.value as Gender }))}
                            className="w-full bg-dark-input border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-neon-purple appearance-none"
                        >
                            {(['Не указано', 'Женский', 'Мужской'] as Gender[]).map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Prompt Section */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Дополнительно (Опционально)</label>
                    </div>
                    <textarea 
                        value={config.prompt}
                        onChange={(e) => setConfig(prev => ({ ...prev, prompt: e.target.value }))}
                        placeholder="Пример: Сделай глаза голубыми, добавь веснушки..."
                        className="w-full bg-dark-input border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-neon-purple min-h-[60px] resize-none placeholder:text-gray-600"
                    />
                </div>
            </div>

            <div className="h-10"></div> {/* Spacer */}
        </div>
        
        {/* Footer Action - Fixed at bottom of sidebar */}
        <div className="p-4 bg-dark-surface border-t border-white/10 flex-shrink-0">
             <button 
                onClick={handleGenerate}
                disabled={loading !== 'idle' || !uploadedImage}
                className={`w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-lg text-sm tracking-wide uppercase
                ${loading !== 'idle' || !uploadedImage 
                    ? 'bg-gray-800 cursor-not-allowed opacity-50' 
                    : 'bg-neon-purple hover:bg-neon-purple/90 active:scale-95'}`}
            >
                {loading === 'enhancing' ? (
                    <div className="flex items-center justify-center gap-2">
                        <SparklesIcon className="w-4 h-4 animate-spin" />
                        Реставрация...
                    </div>
                ) : loading === 'generating' ? (
                <div className="flex flex-col items-center justify-center gap-0.5">
                    <div className="flex items-center gap-2">
                         <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                         <span>Генерация...</span>
                    </div>
                    {progressStep && <span className="text-[9px] text-white/70 animate-pulse">{progressStep}</span>}
                </div>
                ) : (
                    "Создать Образ"
                )}
            </button>
        </div>
      </div>

      {/* Right Content: Gallery/Results - Flexible height */}
      <div className="flex-1 bg-dark-bg h-[55dvh] md:h-full relative overflow-y-auto overscroll-contain z-10 flex flex-col">
        {/* Header (Desktop Only) */}
        <div className="hidden md:flex justify-between items-center p-6 border-b border-white/5 bg-dark-bg/95 backdrop-blur-sm sticky top-0 z-30">
             <div className="flex gap-6">
                 <button 
                    onClick={() => setActiveTab('history')}
                    className={`text-sm font-display font-bold transition-colors pb-1 border-b-2 ${activeTab === 'history' ? 'text-white border-neon-purple' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                 >
                     История
                 </button>
                 <button 
                    onClick={() => setActiveTab('favorites')}
                    className={`text-sm font-display font-bold transition-colors pb-1 border-b-2 ${activeTab === 'favorites' ? 'text-white border-neon-purple' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                 >
                     Избранное ({favorites.length})
                 </button>
             </div>

             {displayedResults.length > 0 && (
                 <button onClick={clearHistory} className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-400/10">
                     <TrashIcon className="w-4 h-4" />
                     {activeTab === 'history' ? 'Очистить историю' : 'Очистить избранное'}
                 </button>
             )}
        </div>

        {/* Mobile Header for Results */}
        <div className="md:hidden flex flex-col p-4 sticky top-0 bg-dark-bg/95 backdrop-blur-sm z-30 border-b border-white/5 gap-3">
             <div className="flex justify-between items-center w-full">
                <div className="flex gap-4">
                     <button 
                        onClick={() => setActiveTab('history')}
                        className={`text-sm font-display font-bold transition-colors ${activeTab === 'history' ? 'text-white' : 'text-gray-500'}`}
                    >
                        История
                    </button>
                    <button 
                        onClick={() => setActiveTab('favorites')}
                        className={`text-sm font-display font-bold transition-colors ${activeTab === 'favorites' ? 'text-white' : 'text-gray-500'}`}
                    >
                        Избранное
                    </button>
                </div>
                {displayedResults.length > 0 && (
                    <button onClick={clearHistory} className="p-2 text-red-400"><TrashIcon className="w-4 h-4" /></button>
                )}
             </div>
             {/* Mobile Active Indicator Line */}
             <div className="w-full bg-white/10 h-[1px] relative">
                 <div className={`absolute top-0 h-full bg-neon-purple transition-all duration-300 ${activeTab === 'history' ? 'left-0 w-16' : 'left-20 w-20'}`}></div>
             </div>
        </div>

        <div className="flex-1 p-4 md:p-8 space-y-6">
            {displayedResults.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 mt-10 md:mt-0">
                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                        {activeTab === 'history' ? <ImageIcon className="w-8 h-8 text-gray-400" /> : <HeartIcon className="w-8 h-8 text-gray-400" />}
                    </div>
                    <p className="text-sm font-display font-medium text-gray-300">
                        {activeTab === 'history' ? 'Нет недавних образов' : 'Избранное пусто'}
                    </p>
                    <p className="text-xs text-gray-500 max-w-xs mt-1">
                        {activeTab === 'history' ? 'Загрузите фото и нажмите "Создать Образ"' : 'Сохраняйте понравившиеся результаты сердечком'}
                    </p>
                </div>
            )}

            {displayedResults.map((item) => (
                <div key={item.id} className="bg-dark-card border border-white/5 rounded-2xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Tags */}
                    <div className="flex items-center justify-between p-3 border-b border-white/5 bg-white/5">
                        <div className="flex gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-gray-300 border border-white/10">{item.config.style}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-gray-300 border border-white/10">{item.config.color}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">
                            {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>

                     {/* Static Result View - Click to open Modal */}
                     <div 
                        className="relative w-full aspect-[4/3] md:aspect-square overflow-hidden cursor-pointer group"
                        onClick={() => {
                            setSelectedResult(item);
                            setCompareSlider(50); // Reset slider
                        }}
                    >
                        {/* Frosted Background */}
                        <div className="absolute inset-0 bg-cover bg-center blur-xl opacity-30" style={{ backgroundImage: `url(${item.generatedImage})` }}></div>
                        
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                            <img src={item.generatedImage} alt="Result" className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" />
                        </div>
                        
                        {/* Like Button on Card */}
                        <div className="absolute top-3 right-3 z-20" onClick={(e) => e.stopPropagation()}>
                             <button 
                                onClick={(e) => toggleFavorite(item, e)}
                                className={`p-2 rounded-full backdrop-blur-md transition-all active:scale-95 shadow-lg border border-white/10 
                                ${favorites.some(f => f.id === item.id) ? 'bg-neon-red/20 text-neon-red border-neon-red/30' : 'bg-black/40 text-white hover:bg-black/60'}`}
                             >
                                 <HeartIcon className="w-5 h-5" filled={favorites.some(f => f.id === item.id)} />
                             </button>
                        </div>

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <div className="flex flex-col items-center gap-2">
                                <div className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20">
                                    <ZoomInIcon className="text-white w-6 h-6" />
                                </div>
                                <span className="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full">Развернуть и Сравнить</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between p-3 bg-dark-input border-t border-white/5">
                        <button 
                            onClick={() => handleShare(item.generatedImage)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <ShareIcon className="w-4 h-4" />
                            Поделиться
                        </button>

                        <button 
                            onClick={() => handleDownload(item.generatedImage, 'astoria-result')}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <DownloadIcon className="w-4 h-4" />
                            Скачать
                        </button>
                    </div>
                </div>
            ))}
            
            <div ref={resultsEndRef} />
        </div>
      </div>

      {/* Modal for Fullscreen View & Comparison */}
      {selectedResult && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300">
             
             {/* Header Control Bar */}
             <div 
                className="absolute top-0 left-0 right-0 z-[110] p-4 flex justify-between items-start pointer-events-none"
                style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
            >
                 {/* Invisible Spacer */}
                 <div></div>
                 
                 {/* Close Button - Distinct and Safe */}
                 <button 
                    onClick={() => setSelectedResult(null)}
                    className="pointer-events-auto p-3 bg-black/50 text-white rounded-full border border-white/20 backdrop-blur-md transition-transform active:scale-95 shadow-2xl hover:bg-white/10"
                 >
                     <XIcon className="w-8 h-8" />
                 </button>
             </div>

             {/* Slider Area */}
             <div 
                 className="flex-1 relative w-full h-full overflow-hidden cursor-ew-resize select-none touch-none bg-black"
                 onMouseMove={handleSliderMove}
                 onTouchMove={handleSliderMove}
                 ref={sliderRef}
             >
                 {/* Container for images - removed padding to maximize size, added flex to center */}
                 <div className="relative w-full h-full flex items-center justify-center">
                     
                    {/* Layer 1: After (Generated) - Background */}
                    <img 
                        src={selectedResult.generatedImage} 
                        className="absolute inset-0 w-full h-full object-contain select-none" 
                        alt="After"
                        draggable={false}
                    />

                    {/* Layer 2: Before (Original) - Foreground with Clip Path */}
                    <div 
                        className="absolute inset-0 w-full h-full"
                        style={{ clipPath: `inset(0 ${100 - compareSlider}% 0 0)` }}
                    >
                        <img 
                            src={selectedResult.originalImage} 
                            className="absolute inset-0 w-full h-full object-contain select-none" 
                            alt="Before"
                            draggable={false}
                        />
                    </div>

                     {/* Labels */}
                     <div 
                         className="absolute top-4 left-4 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 z-10 pointer-events-none"
                         style={{ 
                             clipPath: `inset(0 ${100 - compareSlider}% 0 0)`,
                             marginTop: 'max(4rem, env(safe-area-inset-top))' 
                         }}
                     >
                        ДО
                     </div>
                     <div 
                         className="absolute top-4 right-4 bg-neon-purple/80 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 z-10 pointer-events-none"
                         style={{ 
                             clipPath: `inset(0 0 0 ${compareSlider}%)`,
                             marginTop: 'max(4rem, env(safe-area-inset-top))'
                         }}
                     >
                        ПОСЛЕ
                     </div>
                     
                     {/* Slider Line */}
                    <div 
                        className="absolute inset-y-0 w-0.5 bg-white/80 shadow-[0_0_15px_rgba(0,0,0,0.8)] z-20 pointer-events-none"
                        style={{ left: `${compareSlider}%` }}
                    ></div>
                    
                    {/* Slider Handle Button */}
                    <div 
                        className="absolute top-1/2 -translate-y-1/2 w-10 h-10 -ml-5 bg-white rounded-full shadow-2xl flex items-center justify-center z-30 pointer-events-none ring-4 ring-black/20"
                        style={{ left: `${compareSlider}%` }}
                    >
                        <div className="flex gap-1">
                            <div className="w-0.5 h-4 bg-gray-400 rounded-full"></div>
                            <div className="w-0.5 h-4 bg-gray-400 rounded-full"></div>
                        </div>
                    </div>

                 </div>

             </div>

             {/* Modal Footer Controls */}
             <div className="p-6 bg-black/80 backdrop-blur-md flex flex-col md:flex-row justify-center items-center gap-4 z-50 pb-8 md:pb-6 border-t border-white/10">
                 <button 
                    onClick={(e) => toggleFavorite(selectedResult, e)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all
                    ${favorites.some(f => f.id === selectedResult.id) ? 'bg-white/20 text-white' : 'bg-transparent text-gray-300 hover:text-white border border-white/30'}`}
                 >
                     <HeartIcon className="w-5 h-5" filled={favorites.some(f => f.id === selectedResult.id)} />
                     {favorites.some(f => f.id === selectedResult.id) ? 'В избранном' : 'Сохранить'}
                 </button>

                 <button 
                    onClick={() => handleShare(selectedResult.generatedImage)}
                    className="flex items-center gap-2 px-8 py-3 bg-neon-purple text-white rounded-full font-bold shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:scale-105 transition-transform"
                 >
                     <ShareIcon className="w-5 h-5" />
                     Поделиться Результатом
                 </button>
             </div>
        </div>
      )}
    </div>
  );
};

export default HairstyleStudio;

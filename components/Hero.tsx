import React from 'react';
import { ArrowRightIcon } from './ui/Icons';

interface HeroProps {
  onStart: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center overflow-x-hidden bg-dark-bg text-white font-sans">
      {/* Background Gradients - Subtle Pink/Black */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-neon-purple opacity-5 blur-[150px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-neon-purple opacity-5 blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="z-10 w-full max-w-7xl px-6 py-20 flex flex-col items-center text-center">
        
        {/* Header Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="inline-block px-3 py-1 rounded-full border border-neon-purple/30 bg-neon-purple/5 text-neon-purple text-xs font-bold tracking-widest uppercase mb-6">
            Astoria AI Studio
          </div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight leading-tight">
            ИИ-генератор <br/>
            <span className="text-white">причёсок</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Преобразите свой образ с помощью виртуального моделирования. Профессиональный симулятор стрижек, доступный каждому.
          </p>
          <button 
            onClick={onStart}
            className="group relative inline-flex items-center gap-3 px-10 py-5 bg-neon-purple text-white font-bold rounded-full text-lg transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(217,70,239,0.6)]"
          >
            Начните своё путешествие
            <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Features Section - Clean & Minimal */}
        <div className="w-full mb-32">
            <div className="text-center mb-16">
                 <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Основные возможности</h2>
                 <div className="w-20 h-1 bg-neon-purple mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                {/* Feature 1 */}
                <div className="bg-dark-card border border-white/5 rounded-3xl p-8 hover:border-neon-purple/30 transition-colors group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                         <div className="w-20 h-20 rounded-full bg-neon-purple blur-xl"></div>
                    </div>
                    <h3 className="font-display text-xl font-bold text-white mb-3">Виртуальная укладка</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">Примерьте разные причёски виртуально перед реальными изменениями в салоне.</p>
                </div>

                 {/* Feature 2 */}
                 <div className="bg-dark-card border border-white/5 rounded-3xl p-8 hover:border-neon-purple/30 transition-colors group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                         <div className="w-20 h-20 rounded-full bg-white blur-xl"></div>
                    </div>
                    <h3 className="font-display text-xl font-bold text-white mb-3">Множество стилей</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">Выбирайте из сотен модных и классических причёсок под форму вашего лица.</p>
                </div>

                 {/* Feature 3 */}
                 <div className="bg-dark-card border border-white/5 rounded-3xl p-8 hover:border-neon-purple/30 transition-colors group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                         <div className="w-20 h-20 rounded-full bg-neon-purple blur-xl"></div>
                    </div>
                    <h3 className="font-display text-xl font-bold text-white mb-3">Визуализация цвета</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">Просматривайте разные цвета волос и мелирование для полного изменения стиля.</p>
                </div>

                 {/* Feature 4 */}
                 <div className="bg-dark-card border border-white/5 rounded-3xl p-8 hover:border-neon-purple/30 transition-colors group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                         <div className="w-20 h-20 rounded-full bg-white blur-xl"></div>
                    </div>
                    <h3 className="font-display text-xl font-bold text-white mb-3">HD Качество</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">Получайте реалистичные превью с точной цветопередачей и естественным видом.</p>
                </div>
            </div>
        </div>

        {/* Benefits Section */}
        <div className="w-full max-w-6xl mb-32 bg-dark-card rounded-[3rem] p-8 md:p-16 border border-white/5 relative overflow-hidden">
             {/* Background Glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-purple/5 rounded-full blur-[120px] pointer-events-none"></div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
                <div className="text-left space-y-8">
                     <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
                        Идеально подходит для <span className="text-neon-purple">ваших идей</span>
                     </h2>
                     <p className="text-gray-400 text-lg">Узнайте, как ИИ-стилизация поможет уверенно принимать решения о стиле</p>

                     <div className="space-y-6 mt-8">
                         <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-neon-purple/10 flex items-center justify-center text-neon-purple font-bold">1</div>
                            <div>
                                <h4 className="text-white font-bold text-lg">Эксперименты с цветом</h4>
                                <p className="text-gray-500 text-sm">Без риска для волос.</p>
                            </div>
                         </div>
                         <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-neon-purple/10 flex items-center justify-center text-neon-purple font-bold">2</div>
                            <div>
                                <h4 className="text-white font-bold text-lg">Смена стиля</h4>
                                <p className="text-gray-500 text-sm">Кардинальные изменения за секунды.</p>
                            </div>
                         </div>
                         <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-neon-purple/10 flex items-center justify-center text-neon-purple font-bold">3</div>
                            <div>
                                <h4 className="text-white font-bold text-lg">Реалистичность</h4>
                                <p className="text-gray-500 text-sm">Технологии профессиональной реставрации.</p>
                            </div>
                         </div>
                     </div>
                </div>

                {/* Abstract Visual */}
                <div className="relative h-[500px] rounded-3xl overflow-hidden border border-white/10 bg-black flex items-center justify-center group">
                     <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560938368-23c7e8e5095d?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000 transform group-hover:scale-105"></div>
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                     <div className="absolute bottom-8 left-8 text-left">
                         <div className="bg-neon-purple text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">AI GENERATED</div>
                         <p className="text-white font-display text-2xl font-bold">Примерьте новый образ</p>
                     </div>
                </div>
             </div>
        </div>

        {/* How It Works Steps */}
        <div className="w-full max-w-4xl">
            <h2 className="font-display text-3xl font-bold mb-12">Как это работает</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/5">
                     <div className="text-4xl mb-4">📸</div>
                     <h3 className="font-bold text-white mb-2">Загрузите фото</h3>
                     <p className="text-gray-500 text-sm">Чёткое селфи с хорошим светом.</p>
                 </div>
                 <div className="flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/5">
                     <div className="text-4xl mb-4">🎨</div>
                     <h3 className="font-bold text-white mb-2">Выберите стиль</h3>
                     <p className="text-gray-500 text-sm">Цвет, длина, укладка.</p>
                 </div>
                 <div className="flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/5">
                     <div className="text-4xl mb-4">✨</div>
                     <h3 className="font-bold text-white mb-2">Готово</h3>
                     <p className="text-gray-500 text-sm">Сохраните и поделитесь.</p>
                 </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Hero;
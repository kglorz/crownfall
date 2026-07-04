import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ScreenState } from '../../types';
import { Button } from '../ui/Button';
import { ArrowLeft, Volume2, VolumeX, Music, Shield, Sparkles, AlertCircle, Eye, Sliders, X } from 'lucide-react';
import { audio } from '../../lib/audio';

interface SettingsScreenProps {
  setScreen?: (screen: ScreenState) => void;
  isModal?: boolean;
  onClose?: () => void;
}

export function SettingsScreen({ setScreen, isModal = false, onClose }: SettingsScreenProps) {
  const [sfxVolume, setSfxVolume] = useState(0.5);
  const [bgmVolume, setBgmVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  
  // Accessibility and Visual Settings
  const [animationSpeed, setAnimationSpeed] = useState(1.0);
  const [screenShake, setScreenShake] = useState(1.0);
  const [particleDensity, setParticleDensity] = useState(1.0);
  const [combatText, setCombatText] = useState(true);
  const [uiScale, setUiScale] = useState(1.0);

  useEffect(() => {
    setSfxVolume(audio.getSFXVolume());
    setBgmVolume(audio.getBGMVolume());
    
    // Load accessibility settings
    setAnimationSpeed(parseFloat(localStorage.getItem('animationSpeed') || '1.0'));
    setScreenShake(parseFloat(localStorage.getItem('screenShake') || '1.0'));
    setParticleDensity(parseFloat(localStorage.getItem('particleDensity') || '1.0'));
    setCombatText((localStorage.getItem('combatText') || 'true') === 'true');
    setUiScale(parseFloat(localStorage.getItem('uiScale') || '1.0'));
  }, []);

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSfxVolume(val);
    audio.setSFXVolume(val);
    if (val > 0) audio.playHover();
  };

  const handleBgmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setBgmVolume(val);
    audio.setBGMVolume(val);
  };

  const handleToggleMute = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
  };

  // Setters for visual accessibility
  const handleAnimationSpeed = (val: number) => {
    setAnimationSpeed(val);
    localStorage.setItem('animationSpeed', val.toString());
  };

  const handleScreenShake = (val: number) => {
    setScreenShake(val);
    localStorage.setItem('screenShake', val.toString());
    if (val > 0) {
      // Small test shake trigger
      const root = document.getElementById('root');
      if (root) {
        root.classList.add('animate-shake-test');
        setTimeout(() => root.classList.remove('animate-shake-test'), 300);
      }
    }
  };

  const handleParticleDensity = (val: number) => {
    setParticleDensity(val);
    localStorage.setItem('particleDensity', val.toString());
  };

  const handleCombatText = (val: boolean) => {
    setCombatText(val);
    localStorage.setItem('combatText', val.toString());
  };

  const handleUiScale = (val: number) => {
    setUiScale(val);
    localStorage.setItem('uiScale', val.toString());
    
    // Dynamically apply visual scaling to preview
    const appContainer = document.getElementById('root');
    if (appContainer) {
      appContainer.style.transform = `scale(${val})`;
      appContainer.style.transformOrigin = 'top center';
    }
  };

  const content = (
    <motion.div
      initial={isModal ? { opacity: 0, scale: 0.95, y: 15 } : { opacity: 0 }}
      animate={isModal ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1 }}
      exit={isModal ? { opacity: 0, scale: 0.95, y: 15 } : { opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={
        isModal
          ? "bg-stone-900 border border-stone-800 rounded-sm w-full max-w-4xl max-h-[85vh] flex flex-col p-6 md:p-8 shadow-2xl relative overflow-hidden"
          : "flex flex-col h-screen relative p-8 max-w-4xl mx-auto w-full"
      }
    >
      <div className="w-full flex justify-between items-center mb-8">
        <h1 className="font-cinzel text-3xl md:text-4xl text-stone-200 tracking-widest uppercase">Settings</h1>
        {isModal ? (
          <button 
            onClick={onClose} 
            className="p-1.5 text-stone-400 hover:text-stone-100 transition-colors rounded-sm hover:bg-stone-800 border border-transparent hover:border-stone-700"
            aria-label="Close"
            id="close-settings-modal"
          >
            <X className="w-6 h-6" />
          </button>
        ) : (
          <Button variant="ghost" onClick={() => setScreen?.('MAIN_MENU')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Menu
          </Button>
        )}
      </div>

      <div className="w-full bg-stone-900/50 border border-stone-800 rounded-sm flex-1 p-6 md:p-8 flex flex-col gap-8 overflow-y-auto custom-scrollbar-red">
        {/* Row 1: Audio and Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Audio Subsection */}
          <div className="space-y-6 bg-stone-950/40 p-6 border border-stone-800/60 rounded">
            <h2 className="font-cinzel text-lg text-gold-500 tracking-widest uppercase border-b border-stone-850 pb-2 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-gold-500" /> Audio Setup
            </h2>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-cinzel text-xs text-stone-300 tracking-wider">Sound Effects Volume</span>
                  <span className="font-mono text-stone-500 text-xs">{Math.round(sfxVolume * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={sfxVolume}
                  onChange={handleSfxChange}
                  style={{
                    background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${sfxVolume * 100}%, #292524 ${sfxVolume * 100}%, #292524 100%)`
                  }}
                  className="w-full h-1 rounded-sm appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blood-500 [&::-webkit-slider-thumb]:rounded-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-cinzel text-xs text-stone-300 tracking-wider">Medieval BGM Volume</span>
                  <span className="font-mono text-stone-500 text-xs">{Math.round(bgmVolume * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={bgmVolume}
                  onChange={handleBgmChange}
                  style={{
                    background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${bgmVolume * 100}%, #292524 ${bgmVolume * 100}%, #292524 100%)`
                  }}
                  className="w-full h-1 rounded-sm appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blood-500 [&::-webkit-slider-thumb]:rounded-sm"
                />
              </div>

              <div className="pt-4 border-t border-stone-800/40 flex justify-between items-center">
                <span className="font-cinzel text-xs text-stone-400 tracking-wider">Mute All Audio</span>
                <Button variant="outline" size="sm" onClick={handleToggleMute} className="gap-2 text-xs">
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-blood-500 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                  {isMuted ? 'Muted' : 'Mute'}
                </Button>
              </div>
            </div>
          </div>

          {/* Visual Presentation Subsection */}
          <div className="space-y-6 bg-stone-950/40 p-6 border border-stone-800/60 rounded">
            <h2 className="font-cinzel text-lg text-gold-500 tracking-widest uppercase border-b border-stone-850 pb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-500" /> Graphics & VFX
            </h2>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-cinzel text-xs text-stone-300 tracking-wider">Screen Shake Intensity</span>
                  <span className="font-mono text-stone-500 text-xs">{Math.round(screenShake * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1.5" 
                  step="0.1" 
                  value={screenShake}
                  onChange={(e) => handleScreenShake(parseFloat(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${(screenShake / 1.5) * 100}%, #292524 ${(screenShake / 1.5) * 100}%, #292524 100%)`
                  }}
                  className="w-full h-1 rounded-sm appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blood-500 [&::-webkit-slider-thumb]:rounded-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-cinzel text-xs text-stone-300 tracking-wider">Particle Density</span>
                  <span className="font-mono text-stone-500 text-xs">{Math.round(particleDensity * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1.5" 
                  step="0.1" 
                  value={particleDensity}
                  onChange={(e) => handleParticleDensity(parseFloat(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${(particleDensity / 1.5) * 100}%, #292524 ${(particleDensity / 1.5) * 100}%, #292524 100%)`
                  }}
                  className="w-full h-1 rounded-sm appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blood-500 [&::-webkit-slider-thumb]:rounded-sm"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="font-cinzel text-xs text-stone-300 tracking-wider">Combat Text Popups</span>
                <button
                  onClick={() => handleCombatText(!combatText)}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 outline-none ${combatText ? 'bg-blood-600' : 'bg-stone-800'}`}
                >
                  <div className={`w-4 h-4 bg-stone-100 rounded-full shadow-md transform duration-200 ${combatText ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Row 2: Gameplay Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-6 bg-stone-950/40 p-6 border border-stone-800/60 rounded">
            <h2 className="font-cinzel text-lg text-gold-500 tracking-widest uppercase border-b border-stone-850 pb-2 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-gold-500" /> Action Timing
            </h2>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-cinzel text-xs text-stone-300 tracking-wider">Animation Duration Scale</span>
                  <span className="font-mono text-stone-500 text-xs">{Math.round(animationSpeed * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.4" 
                  max="2.0" 
                  step="0.1" 
                  value={animationSpeed}
                  onChange={(e) => handleAnimationSpeed(parseFloat(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${((animationSpeed - 0.4) / 1.6) * 100}%, #292524 ${((animationSpeed - 0.4) / 1.6) * 100}%, #292524 100%)`
                  }}
                  className="w-full h-1 rounded-sm appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blood-500 [&::-webkit-slider-thumb]:rounded-sm"
                />
                <span className="text-[10px] text-stone-500 font-mono">Lower percentage makes animations faster.</span>
              </div>
            </div>
          </div>

          <div className="space-y-6 bg-stone-950/40 p-6 border border-stone-800/60 rounded">
            <h2 className="font-cinzel text-lg text-gold-500 tracking-widest uppercase border-b border-stone-850 pb-2 flex items-center gap-2">
              <Eye className="w-4 h-4 text-gold-500" /> UI Accessibility
            </h2>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-cinzel text-xs text-stone-300 tracking-wider">UI Scale (App Scaling)</span>
                  <span className="font-mono text-stone-500 text-xs">{Math.round(uiScale * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.85" 
                  max="1.15" 
                  step="0.05" 
                  value={uiScale}
                  onChange={(e) => handleUiScale(parseFloat(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${((uiScale - 0.85) / 0.30) * 100}%, #292524 ${((uiScale - 0.85) / 0.30) * 100}%, #292524 100%)`
                  }}
                  className="w-full h-1 rounded-sm appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blood-500 [&::-webkit-slider-thumb]:rounded-sm"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Informative Footer */}
        <div className="mt-4 flex gap-3 p-4 bg-stone-955/60 border border-stone-800/40 rounded text-xs text-stone-400 leading-relaxed font-mono">
          <AlertCircle className="w-5 h-5 text-gold-600 flex-shrink-0" />
          <div>
            <span className="text-stone-300 uppercase font-cinzel font-semibold tracking-wider">Symphonic Synthesis Engaged:</span> All battlefield sounds (metals strikes, spell chimes, troop gallops) are dynamically synthesized live in real-time. Settings persist locally and automatically scale visual layers to protect eye-comfort and ensure high frame-rates.
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
}

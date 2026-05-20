'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, BookOpen, Globe, Award, Send, User } from 'lucide-react';
import KundaliChart from '../../../components/KundaliChart';

interface PlanetPlacement {
  name: string;
  signNumber: number;
  degree?: number;
  retrograde?: boolean;
}

interface HouseInterpretation {
  house: number;
  planets: string[];
  meaning_en: string;
  meaning_ne: string;
}

interface KundaliResult {
  isUploaded: boolean;
  ascendantSign: number;
  placements: PlanetPlacement[];
  summary_en: string;
  summary_ne: string;
  house_interpretations: HouseInterpretation[];
  remedies_en: string;
  remedies_ne: string;
}

// Fallback sample data in case storage is empty
const defaultResult: KundaliResult = {
  isUploaded: false,
  ascendantSign: 1,
  placements: [
    { name: 'सू', signNumber: 1, degree: 14.2 },
    { name: 'चं', signNumber: 8, degree: 22.5 },
    { name: 'मं', signNumber: 1, degree: 4.1 },
    { name: 'गु', signNumber: 4, degree: 12.4 },
  ],
  summary_en: 'This is a sample chart generated from high-fidelity default values. Explore the placement of key planets and their impacts on different areas of your life.',
  summary_ne: 'यो पूर्वनिर्धारित मानहरूबाट उत्पन्न गरिएको नमूना कुण्डली हो। तपाईंको जीवनका विभिन्न क्षेत्रमा ग्रहहरूको प्रभाव र तिनको स्थानको बारेमा बुझ्नुहोस्।',
  house_interpretations: [
    { house: 1, planets: ['সূ', 'मं'], meaning_en: 'Strong, energetic presence in the physical realm. Leadership qualities are highlighted.', meaning_ne: 'शारीरिक रूपमा बलियो र ऊर्जावान उपस्थिति। नेतृत्वदायी क्षमताहरू उजागर हुन्छन्।' },
    { house: 4, planets: ['गु'], meaning_en: 'Abundance in family comfort, wisdom, and emotional support.', meaning_ne: 'पारिवारिक सुख, बुद्धिमत्ता र भावनात्मक समर्थनमा प्रचुरता।' },
    { house: 8, planets: ['चं'], meaning_en: 'Intuitive mind, deep interest in hidden or mystical sciences.', meaning_ne: 'अन्तर्ज्ञानयुक्त मन, रहस्यमय विज्ञान वा गुप्त शास्त्रमा गहिरो रुचि।' },
  ],
  remedies_en: 'Focus on daily breathing exercises (Pranayama) and express gratitude to maintain dynamic harmony.',
  remedies_ne: 'गतिशील सामंजस्य कायम राख्न दैनिक प्राणायाम गर्नुहोस् र कृतज्ञता प्रकट गर्नुहोस्।'
};

export default function ChartResultPage() {
  const [result, setResult] = useState<KundaliResult | null>(null);
  const [lang, setLang] = useState<'en' | 'ne'>('en');
  const [activeHouseTab, setActiveHouseTab] = useState<number | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | undefined>(undefined);
  const router = useRouter();

  // Chat State
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    setMessages([
      {
        role: 'model',
        content: lang === 'en'
          ? "Namaste! I am your Astro Guru AI companion. I have reviewed your planetary positions and house alignments. Please ask me any questions about your personality, career path, relationship potential, challenging placements, or specific Vedic remedies!"
          : "नमस्ते! म तपाईंको ज्योतिष गुरु एआई साथी हुँ। मैले तपाईंको ग्रहको स्थिति र भावहरूको अध्ययन गरिसकेको छु। कृपया मलाई तपाईंको व्यक्तित्व, करियर, वैवाहिक जीवन, कमजोर ग्रह वा विशेष शान्तिका उपायहरूका बारेमा कुनै पनि प्रश्न सोध्नुहोस्!"
      }
    ]);
  }, [lang]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');

    const updatedMessages = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(updatedMessages);
    setChatLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chart/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chart_info: {
            ascendantSign: result?.ascendantSign || 1,
            placements: result?.placements || [],
            summary_en: result?.summary_en || '',
            summary_ne: result?.summary_ne || ''
          },
          messages: updatedMessages
        })
      });

      if (!response.ok) throw new Error('Guru is reflecting on deep cosmic patterns. Please try again.');
      const data = await response.json();
      setMessages([...updatedMessages, { role: 'model', content: data.response }]);
    } catch (err: any) {
      setMessages([...updatedMessages, { role: 'model', content: err.message || 'An error occurred.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('kundali_result');
      if (stored) {
        setResult(JSON.parse(stored));
      } else {
        setResult(defaultResult);
      }
    } catch (e) {
      setResult(defaultResult);
    }
  }, []);

  if (!result) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500/20 border-t-amber-500"></div>
      </div>
    );
  }

  const { ascendantSign, placements, summary_en, summary_ne, house_interpretations, remedies_en, remedies_ne } = result;

  return (
    <section className="grid gap-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <button 
          onClick={() => router.push('/chart')} 
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-all w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Generator
        </button>

        <div className="flex items-center gap-3">
          <Globe className="h-4 w-4 text-amber-400" />
          <div className="inline-flex rounded-md border border-slate-700 p-0.5 bg-slate-950">
            <button 
              onClick={() => setLang('en')}
              className={`rounded px-3 py-1 text-xs font-semibold transition-all ${
                lang === 'en' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
            <button 
              onClick={() => setLang('ne')}
              className={`rounded px-3 py-1 text-xs font-semibold transition-all ${
                lang === 'ne' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              नेपाली
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid gap-8 lg:grid-cols-[450px_1fr]">
        
        {/* Left Column: Interactive SVG Chart */}
        <div className="flex flex-col gap-6">
          <div className="aspect-square w-full max-w-[450px] mx-auto">
            <KundaliChart 
              ascendantSign={ascendantSign} 
              placements={placements} 
              highlightPlanet={hoveredPlanet}
            />
          </div>
          
          {/* Quick Legend Info */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">Planet Legend</h4>
            <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
              <span>सू : Sun</span>
              <span>चं : Moon</span>
              <span>मं : Mars</span>
              <span>बु : Mercury</span>
              <span>गु / बृ : Jupiter</span>
              <span>शु : Venus</span>
              <span>श : Saturn</span>
              <span>रा : Rahu</span>
              <span>के : Ketu</span>
            </div>
            {result.isUploaded && (
              <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-3 py-2 rounded">
                <Award className="h-4 w-4" /> Multi-modal Gemini analysis generated directly from uploaded chart photo.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Explanation & Astrological Details */}
        <div className="grid content-start gap-6">
          
          {/* Main Psychological Summary */}
          <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 text-amber-400/20">
              <Sparkles className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-semibold flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5 text-amber-400" /> 
              {lang === 'en' ? 'Vedic Personality & Life Path Analysis' : 'वैदिक व्यक्तित्व र जीवन यात्रा विश्लेषण'}
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300 whitespace-pre-line">
              {lang === 'en' ? summary_en : summary_ne}
            </p>
          </div>

          {/* House Placements Accordion */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/20 p-6">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-white mb-4">
              <BookOpen className="h-5 w-5 text-amber-400" />
              {lang === 'en' ? 'House Placements & Planet Impacts' : 'भावगत स्थान र ग्रहको प्रभाव'}
            </h3>
            
            {house_interpretations.length === 0 ? (
              <p className="text-sm text-slate-400">{lang === 'en' ? 'No specific active planet interpretations found.' : 'कुनै सक्रिय ग्रहहरूको व्याख्या फेला परेन।'}</p>
            ) : (
              <div className="grid gap-3">
                {house_interpretations.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`rounded-lg border transition-all ${
                      activeHouseTab === idx 
                        ? 'border-amber-500 bg-slate-950/80 shadow-md' 
                        : 'border-slate-800 bg-slate-950/30 hover:border-slate-700'
                    }`}
                  >
                    <button
                      onClick={() => setActiveHouseTab(activeHouseTab === idx ? null : idx)}
                      onMouseEnter={() => setHoveredPlanet(item.planets[0])}
                      onMouseLeave={() => setHoveredPlanet(undefined)}
                      className="w-full flex items-center justify-between p-4 text-left font-medium"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-950 border border-amber-500/30 text-sm font-bold text-amber-400 shadow-inner">
                          {item.house}
                        </span>
                        <div>
                          <span className="text-sm text-slate-200">
                            {lang === 'en' ? `House ${item.house} Placement` : `भाव ${item.house} को स्थान`}
                          </span>
                          <span className="ml-2 text-xs text-slate-400 border border-slate-800 bg-slate-900 px-2 py-0.5 rounded">
                            {item.planets.join(', ')}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-amber-400 font-semibold">
                        {activeHouseTab === idx ? (lang === 'en' ? 'Collapse' : 'कम गर्नुहोस्') : (lang === 'en' ? 'Expand' : 'थप हेर्नुहोस्')}
                      </span>
                    </button>
                    
                    {activeHouseTab === idx && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-900 text-sm leading-relaxed text-slate-300 animate-fadeIn">
                        {lang === 'en' ? item.meaning_en : item.meaning_ne}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Remedies Section */}
          <div className="rounded-lg border border-amber-600/30 bg-amber-950/10 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-700 w-full"></div>
            <h3 className="text-lg font-semibold text-amber-400 flex items-center gap-2">
              🕊️ {lang === 'en' ? 'Remedial Safeguards & Suggestions' : 'शान्तिका उपायहरू र सल्लाहहरू'}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-300 whitespace-pre-line">
              {lang === 'en' ? remedies_en : remedies_ne}
            </p>
          </div>

          {/* Conversational Astro Guru Chat Panel */}
          <div className="rounded-lg border border-slate-700/60 bg-slate-900/10 p-5 flex flex-col h-[400px] shadow-xl backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
              💬 {lang === 'en' ? 'Talk to Astro Guru AI' : 'ज्योतिष गुरु एआईसँग कुराकानी'}
            </h3>
            <p className="text-xs text-slate-400 mb-3 border-b border-slate-800 pb-2">
              {lang === 'en' 
                ? 'Ask custom questions about your personality, health, remedies, or planets.' 
                : 'तपाईंको व्यक्तित्व, स्वास्थ्य, उपायहरू वा ग्रहहरूको बारेमा प्रश्न सोध्नुहोस्।'}
            </p>
            
            {/* Scrollable messages area */}
            <div className="flex-1 overflow-y-auto mb-3 space-y-3 pr-1 [scrollbar-width:thin] [color-scheme:dark]">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex gap-2 max-w-[85%] ${
                    msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold border ${
                    msg.role === 'user' 
                      ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md' 
                      : 'bg-slate-800 border-slate-700 text-slate-200 shadow-inner'
                  }`}>
                    {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : 'ॐ'}
                  </div>
                  <div className={`rounded-lg px-3 py-2 text-xs leading-5 leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-amber-500/15 border border-amber-500/20 text-amber-200' 
                      : 'bg-slate-950/80 border border-slate-800/80 text-slate-300'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-2 mr-auto max-w-[80%] items-center">
                  <div className="h-7 w-7 rounded-full bg-slate-800 border border-slate-700 text-[10px] flex items-center justify-center font-bold text-slate-200 shrink-0 shadow-inner">
                    ॐ
                  </div>
                  <div className="rounded-lg px-3 py-2 bg-slate-950/80 border border-slate-800/80 text-slate-400 text-xs flex items-center gap-1.5 shadow-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce"></div>
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]"></div>
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Input field area */}
            <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-slate-800/60 pt-3">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={lang === 'en' ? 'Ask Guru (e.g. explain my Jupiter placement)...' : 'गुरुलाई सोध्नुहोस्...'}
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white outline-none focus:border-amber-500 transition-all placeholder-slate-500"
              />
              <button 
                type="submit"
                disabled={!chatInput.trim() || chatLoading}
                className={`p-2 rounded transition-all flex items-center justify-center shrink-0 ${
                  chatInput.trim() && !chatLoading
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer' 
                    : 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'
                }`}
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}

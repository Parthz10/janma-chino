'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, BookOpen, Globe, Award, Send, User, Heart } from 'lucide-react';
import KundaliChart from '../../../components/KundaliChart';
import GunaMeter from '../../../components/GunaMeter';

interface PlanetPlacement {
  name: string;
  signNumber: number;
  degree?: number;
  retrograde?: boolean;
}

interface CompatibilityResult {
  brideName: string;
  groomName: string;
  brideChart: {
    ascendantSign: number;
    placements: PlanetPlacement[];
  };
  groomChart: {
    ascendantSign: number;
    placements: PlanetPlacement[];
  };
  koota: {
    categories: { [key: string]: number };
    total: number;
    max: number;
    doshas: { [key: string]: boolean };
  };
  synergy: {
    overall_percentage: number;
    narrative_summary_en: string;
    narrative_summary_ne: string;
    bhakoot_analysis: {
      score_meaning_en: string;
      score_meaning_ne: string;
    };
    nadi_analysis: {
      score_meaning_en: string;
      score_meaning_ne: string;
    };
    remedial_measures_en: string;
    remedial_measures_ne: string;
  };
  brideMoonDetails: any;
  groomMoonDetails: any;
}

// Fallback high-fidelity sample data in case storage is empty
const defaultResult: CompatibilityResult = {
  brideName: 'Bride (कन्या)',
  groomName: 'Groom (वर)',
  brideChart: {
    ascendantSign: 8,
    placements: [
      { name: 'चं', signNumber: 8, degree: 22.5 },
      { name: 'मं', signNumber: 1, degree: 4.1 }
    ]
  },
  groomChart: {
    ascendantSign: 4,
    placements: [
      { name: 'चं', signNumber: 4, degree: 8.5 },
      { name: 'गु', signNumber: 4, degree: 18.2 }
    ]
  },
  koota: {
    categories: {
      'Varna': 1,
      'Vashya': 2,
      'Tara': 3,
      'Yoni': 2,
      'Graha Maitri': 5,
      'Gana': 6,
      'Bhakoot': 7,
      'Nadi': 8
    },
    total: 34,
    max: 36,
    doshas: {
      'gana': false,
      'bhakoot': false,
      'nadi': false
    }
  },
  synergy: {
    overall_percentage: 94,
    narrative_summary_en: "The Moon-based compatibility matrix shows exceptionally strong alignment (94/100). Emotional chemistry is deep, supportive, and intuitive. Mental values synchronize beautifully, fostering deep mutual trust and joint growth across life pursuits.",
    narrative_summary_ne: "चन्द्रमामा आधारित मिलान तालिकाले ९४ प्रतिशतको उच्च सामंजस्यता प्रदर्शन गर्दछ। एकअर्का बीच भावनात्मक रसायनशास्त्र गहिरो, सहयोगी र अन्तर्ज्ञानयुक्त छ। मानसिक तालमेलले बलियो आपसी विश्वास र संयुक्त प्रगतिलाई बढावा दिन्छ।",
    bhakoot_analysis: {
      score_meaning_en: "Constructive 5-9 house relationships promote shared creative expression, healthy offspring dynamics, and expanding wisdom in your joint life journey.",
      score_meaning_ne: "५-९ भकूट मिलानले सिर्जनात्मक अभिव्यक्ति, उत्कृष्ट सन्तान सुख र जीवन यात्रामा साझा बुद्धिको विकासलाई बढावा दिन्छ।"
    },
    nadi_analysis: {
      score_meaning_en: "Different Nadis (Adi and Madhya) indicate perfect physical compatibility, cellular balance, and absolute physiological protection.",
      score_meaning_ne: "फरक नाडीहरू (आदि र मध्य) ले उत्कृष्ट शारीरिक अनुकूलता, सुखद वैवाहिक स्वास्थ्य र जैविक सन्तुलन सुनिश्चित गर्दछ।"
    },
    remedial_measures_en: "No serious doshas detected. For enhanced abundance, consider donating yellow garments to elders on Thursdays and participating in charitable work together.",
    remedial_measures_ne: "कुनै गम्भीर दोषहरू फेला परेनन्। सुख-समृद्धि वृद्धिका लागि बिहीबारका दिन वृद्धहरूलाई पहेंलो वस्त्र दान गर्न सक्नुहुन्छ र सँगै परोपकारी काममा भाग लिनुहोस्।"
  },
  brideMoonDetails: { moon_nakshatra_index: 17, moon_pada: 2, moon_sign: 8 },
  groomMoonDetails: { moon_nakshatra_index: 8, moon_pada: 3, moon_sign: 4 }
};

export default function CompatibilityResultPage() {
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [lang, setLang] = useState<'en' | 'ne'>('en');
  const [activeKootaTab, setActiveKootaTab] = useState<string | null>(null);
  const router = useRouter();

  // Chat State
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('compatibility_result');
      if (stored) {
        setResult(JSON.parse(stored));
      } else {
        setResult(defaultResult);
      }
    } catch (e) {
      setResult(defaultResult);
    }
  }, []);

  useEffect(() => {
    if (!result) return;
    setMessages([
      {
        role: 'model',
        content: lang === 'en'
          ? `Namaste! I am your Astro Guru AI companion. I have reviewed the compatibility match between ${result.brideName} and ${result.groomName}. With an overall affinity score of ${result.synergy.overall_percentage}/100 and Ashta Koota score of ${result.koota.total}/36, I am ready to guide you. Please ask me any questions about emotional alignment, potential conflicts, career success post-marriage, family, or specific Vedic remedies for any placements!`
          : `नमस्ते! म तपाईंको ज्योतिष गुरु एआई साथी हुँ। मैले ${result.brideName} र ${result.groomName} बीचको कुण्डली मिलानको विश्लेषण गरेको छु। ९०% भन्दा बढी सामंजस्य र ३६ मध्ये ${result.koota.total} गुण मिलानको साथ म तपाईंहरूलाई सल्लाह दिन तयार छु। कृपया मलाई आपसी सम्बन्ध, करियर, भावी सुख-समृद्धि वा शान्तिका उपायहरूको बारेमा कुनै पनि जिज्ञासा सोध्नुहोस्!`
      }
    ]);
  }, [lang, result]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading || !result) return;

    const userMsg = chatInput.trim();
    setChatInput('');

    const updatedMessages = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(updatedMessages);
    setChatLoading(true);

    try {
      const response = await fetch('http://localhost:8000/compatibility/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bride: {
            name: result.brideName,
            moonDetails: result.brideMoonDetails,
            ascendantSign: result.brideChart.ascendantSign
          },
          groom: {
            name: result.groomName,
            moonDetails: result.groomMoonDetails,
            ascendantSign: result.groomChart.ascendantSign
          },
          koota: result.koota,
          synergy: result.synergy,
          messages: updatedMessages
        })
      });

      if (!response.ok) throw new Error('Guru is reflecting on deep cosmic relationship charts. Please try again.');
      const data = await response.json();
      setMessages([...updatedMessages, { role: 'model', content: data.response }]);
    } catch (err: any) {
      setMessages([...updatedMessages, { role: 'model', content: err.message || 'An error occurred.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (!result) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500/20 border-t-amber-500"></div>
      </div>
    );
  }

  const { brideName, groomName, brideChart, groomChart, koota, synergy } = result;

  const kootaMaxPoints: { [key: string]: number } = {
    'Varna': 1, 'Vashya': 2, 'Tara': 3, 'Yoni': 4, 'Graha Maitri': 5, 'Gana': 6, 'Bhakoot': 7, 'Nadi': 8
  };

  const getKootaDescription = (name: string, score: number, max: number) => {
    if (name === 'Bhakoot') {
      return lang === 'en' ? synergy.bhakoot_analysis.score_meaning_en : synergy.bhakoot_analysis.score_meaning_ne;
    }
    if (name === 'Nadi') {
      return lang === 'en' ? synergy.nadi_analysis.score_meaning_en : synergy.nadi_analysis.score_meaning_ne;
    }

    const descriptions: { [key: string]: { en: string; ne: string } } = {
      'Varna': {
        en: score > 0 
          ? "Excellent spiritual alignment. Both partners share cooperative egos and harmonizing work-life mindsets."
          : "Different work temperaments. Fostering communication and dividing household leadership roles will resolve minor friction.",
        ne: score > 0
          ? "उत्कृष्ट आध्यात्मिक समझदारी। दुबैमा सहयोगी व्यवहार र कामप्रतिको दृष्टिकोण मिल्दोजुल्दो छ।"
          : "कार्यशैली फरक हुनसक्छ। आपसी सरसल्लाह र जिम्मेवारी बाँडफाँड गर्नाले सजिलै सामंजस्यता कायम हुन्छ।"
      },
      'Vashya': {
        en: score === 2 
          ? "Optimal attraction and natural compliance. You will communicate effortlessly and share intuitive mutual respect."
          : score === 1 
            ? "Friendly mutual respect. Clear conversation keeps your natural connection strong."
            : "Minor personality differences. Emphasize active listening and emotional validation to support each other.",
        ne: score === 2
          ? "प्राकृतिक आकर्षण र गहिरो समझदारी। एकअर्कालाई बुझ्न धेरै प्रयास गर्नु पर्दैन र ठूलो आदर भाव रहन्छ।"
          : score === 1
            ? "मैत्रीपूर्ण सम्बन्ध। कुराकानी स्पष्ट राख्नाले आपसी बन्धन सधैं बलियो रहन्छ।"
            : "सानो मतभेद हुन सक्छ। एकअर्काको कुरा ध्यान दिएर सुन्ने र भावनाको कदर गर्नाले सम्बन्ध सुदृढ हुन्छ।"
      },
      'Tara': {
        en: score >= 1.5 
          ? "Favorable cosmic destiny paths. Your astrological vibration pattern promotes joint fortune and good health."
          : "Average destiny alignment. Focus on conscious lifestyle choices, exercising together, and supporting health goals.",
        ne: score >= 1.5
          ? "अनुकूल भाग्य पथ। तपाईंहरूको नक्षत्रको तरंगले आपसी सफलता र राम्रो स्वास्थ्यलाई साथ दिन्छ।"
          : "मध्यम भाग्यको योग। स्वास्थ्यकर जीवनशैली अपनाउने र एकअर्काको उन्नतिमा ध्यान दिने गर्दा फाइदा हुन्छ।"
      },
      'Yoni': {
        en: score === 4 
          ? "Absolute physical, biological, and physiological compatibility. Intimacy is highly harmonious and supportive."
          : score >= 2 
            ? "Friendly physiological matching. Natural physical bond with warm chemistry."
            : "Minor physical/temperamental mismatch. Cultivating emotional warmth, gentle patience, and open communication will create deep intimacy.",
        ne: score === 4
          ? "शारीरिक र जैविक रूपमा पूर्ण अनुकूलता। आपसी सामीप्यता अत्यन्तै सुखद र प्राकृतिक रूपमा सहयोगी रहन्छ।"
          : score >= 2
            ? "राम्रो शारीरिक आकर्षण। सम्बन्धमा मित्रवत भाव र न्यानोपन कायम रहन्छ।"
            : "स्वभाव र जैविक ऊर्जामा थोरै भिन्नता। धैर्यता, आत्मियता र प्रेमपूर्ण व्यवहारले आकर्षण झन् बढाउँछ।"
      },
      'Graha Maitri': {
        en: score >= 4 
          ? "Lords of both Moon signs are close friends. Deep intellectual, psychological, and conversational alignment."
          : score >= 1 
            ? "Neutral planetary friendship. You share stable values, though views on money or hobbies may vary slightly."
            : "Planetary friction. Establish strong communication protocols and respect each other's independence to avoid minor friction.",
        ne: score >= 4
          ? "चन्द्र राशिका स्वामीहरू परम मित्र छन्। बौद्धिक, मानसिक र कुराकानीको स्तरमा गहिरो तालमेल छ।"
          : score >= 1
            ? "समान्य ग्रह मैत्री। विचार र रुचिमा सामान्य भिन्नता भए पनि जीवनका मुख्य मूल्यहरूमा स्थायित्व रहन्छ।"
            : "राशी स्वामीहरू बीच सामान्य मतभेद। एकअर्काको स्वतन्त्रताको कदर गर्दै विचार आदानप्रदान गर्दा खटपट हुँदैन।"
      },
      'Gana': {
        en: score === 6 
          ? "Aligned temperaments. Both of you naturally view life with shared philosophies, maintaining dynamic peace."
          : score >= 3 
            ? "Balanced differences. One partner brings logical stability while the other brings creative emotional flow."
            : "Gana Dosha present. Cultivate strict respect for each other's viewpoints, avoid ego clashes, and perform daily meditation together.",
        ne: score === 6
          ? "स्वभाव र व्यवहारमा अनुकूलता। दुबैको जीवन दर्शन मिल्ने हुनाले घरमा सधैं शान्ति र स्थिरता रहन्छ।"
          : score >= 3
            ? "सन्तुलित भिन्नता। एकजनाले तार्किक स्थिरता ल्याउँदा अर्कोले रचनात्मक र भावनात्मक ऊर्जा प्रदान गर्दछ।"
            : "गण दोषको प्रभाव हुन सक्छ। रिस र घमण्ड त्याग्ने, आपसी आदर कायम राख्ने र नियमित ध्यान गर्नाले दोष कम हुन्छ।"
      }
    };

    return descriptions[name] ? (lang === 'en' ? descriptions[name].en : descriptions[name].ne) : "";
  };

  const getPercentageColor = (percent: number) => {
    if (percent >= 80) return 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30';
    if (percent >= 60) return 'text-amber-400 bg-amber-950/20 border-amber-900/30';
    return 'text-rose-400 bg-rose-950/20 border-rose-900/30';
  };

  return (
    <section className="grid gap-6 px-4">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <button 
          onClick={() => router.push('/compatibility')} 
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-all w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Matcher
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

      {/* Affinity & Score Cards Header */}
      <div className="grid items-center gap-6 rounded-xl border border-slate-700 bg-slate-900/40 p-6 lg:grid-cols-[220px_1fr_220px] shadow-2xl backdrop-blur-md">
        
        {/* Ashta Koota Guna Meter */}
        <div className="flex justify-center">
          <GunaMeter value={koota.total} max={koota.max} />
        </div>

        {/* Dynamic Affinity Rating Description */}
        <div className="text-center lg:text-left">
          <span className="px-3 py-1 rounded-full border border-amber-500/20 bg-amber-950/20 text-xs font-bold uppercase tracking-[0.15em] text-amber-300">
            {lang === 'en' ? 'Synastry Synthesis' : 'सामंजस्य विश्लेषण'}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-white">
            {koota.total >= 25 
              ? (lang === 'en' ? 'Highly Auspicious Match' : 'अत्यन्तै शुभ मिलान') 
              : koota.total >= 18 
                ? (lang === 'en' ? 'Compatible & Healthy Match' : 'अनुकूल र स्वस्थ मिलान') 
                : (lang === 'en' ? 'Challenging Placements' : 'संवेदनशील ग्रहस्थिति')}
          </h1>
          <p className="mt-3 leading-7 text-slate-300 max-w-2xl">
            {lang === 'en' 
              ? `Calculations show a matching points of ${koota.total} out of 36 Gunas. Traditional Vedic guidelines suggest a highly supportive bond with dynamic emotional understanding and biological security.`
              : `३६ गुणमध्ये ${koota.total} गुण मिलान भएको छ। परम्परागत वैदिक ज्योतिष अनुसार यस मिलानले आपसी समझदारी, सुखद पारिवारिक जीवन र जैविक रूपमा स्वस्थ सन्तानको योग दर्साउँछ।`}
          </p>
        </div>

        {/* Affinity Percentage Score /100 */}
        <div className="flex flex-col items-center justify-center p-5 rounded-xl border border-slate-800 bg-slate-950/60 shadow-inner">
          <Heart className="h-8 w-8 text-amber-500 animate-pulse mb-2" />
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Affinity Score</span>
          <div className="text-4xl font-extrabold text-white mt-1">{synergy.overall_percentage}<span className="text-sm text-slate-500">/100</span></div>
          <span className="text-[10px] text-amber-300 mt-2 font-medium bg-amber-950/30 px-2 py-0.5 rounded border border-amber-900/30">
            {synergy.overall_percentage >= 80 
              ? (lang === 'en' ? 'Excellent' : 'उत्कृष्ट') 
              : synergy.overall_percentage >= 60 
                ? (lang === 'en' ? 'Good' : 'राम्रो') 
                : (lang === 'en' ? 'Caution' : 'शान्ति आवश्यक')}
          </span>
        </div>

      </div>

      {/* Dual Charts Visualization */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5 flex flex-col items-center shadow-md">
          <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
            {brideName}
          </h3>
          <div className="aspect-square w-full max-w-[360px]">
            <KundaliChart ascendantSign={brideChart.ascendantSign} placements={brideChart.placements} highlightPlanet="चं" />
          </div>
          <span className="mt-3 text-xs text-slate-400">Rising Sign (लग्न): {brideChart.ascendantSign} · Highlighted: Moon (चं)</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5 flex flex-col items-center shadow-md">
          <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
            {groomName}
          </h3>
          <div className="aspect-square w-full max-w-[360px]">
            <KundaliChart ascendantSign={groomChart.ascendantSign} placements={groomChart.placements} highlightPlanet="चं" />
          </div>
          <span className="mt-3 text-xs text-slate-400">Rising Sign (लग्न): {groomChart.ascendantSign} · Highlighted: Moon (चं)</span>
        </div>
      </div>

      {/* AI Narrative & Detailed Kootas */}
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        
        <div className="grid content-start gap-6">
          {/* Main Psychological Synergy Summary */}
          <div className="rounded-xl border border-slate-700 bg-slate-900/30 p-6 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 p-4 text-amber-500/10">
              <Sparkles className="h-14 w-14" />
            </div>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5 text-amber-400" />
              {lang === 'en' ? 'Psychological & Behavioral Synergy' : 'मनोवैज्ञानिक र व्यावहारिक अनुकूलता'}
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300 whitespace-pre-line">
              {lang === 'en' ? synergy.narrative_summary_en : synergy.narrative_summary_ne}
            </p>
          </div>

          {/* 8 Kootas Detailed Accordion */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/10 p-6 shadow-md">
            <h3 className="text-xl font-bold flex items-center gap-2 text-white mb-4">
              <BookOpen className="h-5 w-5 text-amber-400" />
              {lang === 'en' ? 'Ashta Koota Category Breakdown' : 'अष्टकूट श्रेणीगत विवरण'}
            </h3>

            <div className="grid gap-3">
              {Object.entries(kootaMaxPoints).map(([name, maxPoints]) => {
                const score = koota.categories[name] !== undefined ? koota.categories[name] : maxPoints;
                const isDosha = (name === 'Gana' && koota.doshas.gana) || 
                                (name === 'Bhakoot' && koota.doshas.bhakoot) || 
                                (name === 'Nadi' && koota.doshas.nadi);
                const isActive = activeKootaTab === name;

                return (
                  <div 
                    key={name}
                    className={`rounded-lg border transition-all ${
                      isActive 
                        ? 'border-amber-500 bg-slate-950/80 shadow-md' 
                        : 'border-slate-800 bg-slate-950/30 hover:border-slate-700'
                    }`}
                  >
                    <button
                      onClick={() => setActiveKootaTab(isActive ? null : name)}
                      className="w-full flex items-center justify-between p-4 text-left font-medium"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-inner ${
                          isDosha 
                            ? 'bg-rose-950 border border-rose-500/30 text-rose-400' 
                            : 'bg-amber-950 border border-amber-500/30 text-amber-400'
                        }`}>
                          {score}
                        </span>
                        <div>
                          <span className="text-sm font-semibold text-slate-200">{name} Match</span>
                          <span className={`ml-2.5 text-[10px] font-bold px-2 py-0.5 rounded ${
                            isDosha 
                              ? 'bg-rose-950 border border-rose-900/30 text-rose-400' 
                              : 'bg-emerald-950 border border-emerald-900/30 text-emerald-400'
                          }`}>
                            {isDosha ? (lang === 'en' ? 'Dosha (!)' : 'दोष (*)') : (lang === 'en' ? 'Safe (+)' : 'अनुकूल')}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">
                        {score} / {maxPoints} pts
                      </span>
                    </button>

                    {isActive && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-900 text-xs leading-relaxed text-slate-300 animate-fadeIn">
                        <p>{getKootaDescription(name, score, maxPoints)}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar: Remedies and Guru AI Chat */}
        <div className="grid content-start gap-6">
          {/* Remedies Card */}
          <div className="rounded-xl border border-amber-600/30 bg-amber-950/10 p-6 relative overflow-hidden shadow-md">
            <div className="absolute top-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-700 w-full"></div>
            <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
              🕊️ {lang === 'en' ? 'Remedial Measures & Spiritual Guides' : 'वैदिक शान्ति र सम्बन्धका उपायहरू'}
            </h3>
            <p className="mt-3 text-xs leading-6 text-slate-300 whitespace-pre-line">
              {lang === 'en' ? synergy.remedial_measures_en : synergy.remedial_measures_ne}
            </p>
          </div>

          {/* Astro Guru AI Compatibility Chat Panel */}
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/20 p-5 flex flex-col h-[420px] shadow-xl backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              💬 {lang === 'en' ? 'Consult Astro Guru AI' : 'ज्योतिष गुरु एआईसँग परामर्श'}
            </h3>
            <p className="text-xs text-slate-400 mb-3 border-b border-slate-800 pb-2">
              {lang === 'en' 
                ? 'Ask customized questions about emotional chemistry, marriage, remedies, or career post-marriage.' 
                : 'वैवाहिक जीवन, व्यापार, दोष निवारण वा शान्तिका उपायहरूको बारेमा गुरुसँग थप परामर्श लिनुहोस्।'}
            </p>
            
            {/* Messages body */}
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
                  <div className={`rounded-lg px-3 py-2 text-[11px] leading-5 leading-relaxed ${
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

            {/* Input area */}
            <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-slate-800/60 pt-3">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={lang === 'en' ? 'Ask Guru about this match...' : 'सम्बन्ध र उपायबारे गुरुलाई सोध्नुहोस्...'}
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

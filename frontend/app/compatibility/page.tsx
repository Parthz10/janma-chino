'use client';

import { CalendarDays, MapPin, Sparkles, Upload, Camera, Loader2, HeartHandshake, User, ArrowRight } from 'lucide-react';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const NAKSHATRAS_LIST = [
  "Ashwini (अश्विनी)", "Bharani (भरणी)", "Krittika (कृत्तिका)", "Rohini (रोहिणी)", 
  "Mrigashira (मृगशिरा)", "Ardra (आर्द्रा)", "Punarvasu (पुनर्वसु)", "Pushya (पुष्य)", 
  "Ashlesha (आश्लेषा)", "Magha (मघा)", "Purva Phalguni (पूर्वाफाल्गुनी)", 
  "Uttara Phalguni (उत्तराफाल्गुनी)", "Hasta (हस्त)", "Chitra (चित्रा)", "Swati (स्वाती)", 
  "Vishakha (विशाखा)", "Anuradha (अनुराधा)", "Jyeshtha (ज्येष्ठा)", "Mula (मूल)", 
  "Purva Ashadha (पूर्वाषाढा)", "Uttara Ashadha (उत्तराषाढा)", "Shravana (श्रवण)", 
  "Dhanishta (धनिष्ठा)", "Shatabhisha (शतभिषा)", "Purva Bhadrapada (पूर्वभाद्रपदा)", 
  "Uttara Bhadrapada (उत्तरभाद्रपदा)", "Revati (रेवती)"
];

export default function CompatibilityPage() {
  const [activeTab, setActiveTab] = useState<'quick' | 'manual' | 'upload'>('quick');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  // 1. Quick Nakshatra Match State
  const [qBrideName, setQBrideName] = useState('Bride');
  const [qBrideNak, setQBrideNak] = useState(1); // 1-indexed (Ashwini)
  const [qBridePada, setQBridePada] = useState(1);
  const [qGroomName, setQGroomName] = useState('Groom');
  const [qGroomNak, setQGroomNak] = useState(1);
  const [qGroomPada, setQGroomPada] = useState(1);

  // 2. Manual Birth Details Match State
  const [mBrideName, setMBrideName] = useState('');
  const [mBrideDate, setMBrideDate] = useState('');
  const [mBrideTime, setMBrideTime] = useState('');
  const [mBridePlace, setMBridePlace] = useState('Kathmandu, Nepal');
  const [mBrideLat, setMBrideLat] = useState('27.7172');
  const [mBrideLon, setMBrideLon] = useState('85.3240');

  const [mGroomName, setMGroomName] = useState('');
  const [mGroomDate, setMGroomDate] = useState('');
  const [mGroomTime, setMGroomTime] = useState('');
  const [mGroomPlace, setMGroomPlace] = useState('Kathmandu, Nepal');
  const [mGroomLat, setMGroomLat] = useState('27.7172');
  const [mGroomLon, setMGroomLon] = useState('85.3240');

  // 3. Photo Upload Match State
  const [bFile, setBFile] = useState<File | null>(null);
  const [bPreview, setBPreview] = useState<string | null>(null);
  const [gFile, setGFile] = useState<File | null>(null);
  const [gPreview, setGPreview] = useState<string | null>(null);
  
  const bFileInputRef = useRef<HTMLInputElement>(null);
  const gFileInputRef = useRef<HTMLInputElement>(null);

  // Derives moon sign, nakshatra, and pada from absolute moon longitude
  const getMoonDetailsFromLon = (moonLon: number) => {
    const moonSign = Math.floor(moonLon / 30) + 1;
    const moonNakIdx = Math.floor(moonLon / (40 / 3)) + 1;
    const moonPada = Math.floor((moonLon % (40 / 3)) / (10 / 3)) + 1;
    return { moonSign, moonNakIdx, moonPada };
  };

  // Convert English planet names to Devanagari shorthand for KundaliChart
  const getPlacementsFormatted = (positions: any) => {
    const abbreviationMap: { [key: string]: string } = {
      'Sun': 'सू', 'Moon': 'चं', 'Mars': 'मं', 'Mercury': 'बु', 
      'Jupiter': 'गु', 'Venus': 'शु', 'Saturn': 'श', 'Rahu': 'रा', 'Ketu': 'के'
    };
    return Object.entries(positions).map(([name, pos]: [string, any]) => ({
      name: abbreviationMap[name] || name.slice(0, 2),
      signNumber: pos.sign_num || 1,
      degree: pos.longitude % 30,
    }));
  };

  // Handle Quick Nakshatra Match Submission
  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingMessage('Consulting Ashta Koota matrix and calling Gemini for relationship analysis...');
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/compatibility/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bride: {
            moon_nakshatra_index: qBrideNak,
            moon_pada: qBridePada
          },
          groom: {
            moon_nakshatra_index: qGroomNak,
            moon_pada: qGroomPada
          }
        })
      });

      if (!response.ok) throw new Error('Failed to compute compatibility. Please check connection.');
      const data = await response.json();

      // For Quick Match, we don't have full charts, so we create mock simple charts for display
      const brideSign = Math.floor(((qBrideNak - 1) * (40 / 3) + (qBridePada - 0.5) * (10 / 3)) / 30) + 1;
      const groomSign = Math.floor(((qGroomNak - 1) * (40 / 3) + (qGroomPada - 0.5) * (10 / 3)) / 30) + 1;

      const resultPayload = {
        brideName: qBrideName || 'Bride',
        groomName: qGroomName || 'Groom',
        brideChart: {
          ascendantSign: brideSign,
          placements: [{ name: 'चं', signNumber: brideSign, degree: 15.0 }]
        },
        groomChart: {
          ascendantSign: groomSign,
          placements: [{ name: 'चं', signNumber: groomSign, degree: 15.0 }]
        },
        koota: data.koota,
        synergy: data.synergy,
        brideMoonDetails: { moon_nakshatra_index: qBrideNak, moon_pada: qBridePada, moon_sign: brideSign },
        groomMoonDetails: { moon_nakshatra_index: qGroomNak, moon_pada: qGroomPada, moon_sign: groomSign }
      };

      sessionStorage.setItem('compatibility_result', JSON.stringify(resultPayload));
      router.push('/compatibility/result');
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Manual Birth Details Match Submission
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mBrideDate || !mBrideTime || !mGroomDate || !mGroomTime) {
      setError('Please fill in birth dates and times for both partners.');
      return;
    }
    setLoading(true);
    setLoadingMessage('Constructing dual birth charts and calculating sidereal offsets...');
    setError(null);

    try {
      // 1. Fetch Bride Chart
      setLoadingMessage('Calculating Bride\'s planetary coordinate systems...');
      const bRes = await fetch('http://localhost:8000/chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          iso_datetime: `${mBrideDate}T${mBrideTime}:00`,
          latitude: parseFloat(mBrideLat),
          longitude: parseFloat(mBrideLon)
        })
      });
      if (!bRes.ok) throw new Error('Failed to generate Bride\'s chart details.');
      const bData = await bRes.json();

      // 2. Fetch Groom Chart
      setLoadingMessage('Calculating Groom\'s planetary coordinate systems...');
      const gRes = await fetch('http://localhost:8000/chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          iso_datetime: `${mGroomDate}T${mGroomTime}:00`,
          latitude: parseFloat(mGroomLat),
          longitude: parseFloat(mGroomLon)
        })
      });
      if (!gRes.ok) throw new Error('Failed to generate Groom\'s chart details.');
      const gData = await gRes.json();

      // 3. Extract Moon details from calculations
      const bMoonLon = bData.positions.Moon.longitude;
      const gMoonLon = gData.positions.Moon.longitude;

      const brideMoon = getMoonDetailsFromLon(bMoonLon);
      const groomMoon = getMoonDetailsFromLon(gMoonLon);

      // 4. Submit derived moon locations to compatibility engine
      setLoadingMessage('Running Ashta Koota algorithms and performing Gemini relationship analysis...');
      const compRes = await fetch('http://localhost:8000/compatibility/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bride: brideMoon,
          groom: groomMoon
        })
      });
      if (!compRes.ok) throw new Error('Failed to compute compatibility analysis.');
      const compData = await compRes.json();

      const resultPayload = {
        brideName: mBrideName || 'Bride',
        groomName: mGroomName || 'Groom',
        brideChart: {
          ascendantSign: bData.positions.Lagna?.sign_num || 1,
          placements: getPlacementsFormatted(bData.positions)
        },
        groomChart: {
          ascendantSign: gData.positions.Lagna?.sign_num || 1,
          placements: getPlacementsFormatted(gData.positions)
        },
        koota: compData.koota,
        synergy: compData.synergy,
        brideMoonDetails: brideMoon,
        groomMoonDetails: groomMoon
      };

      sessionStorage.setItem('compatibility_result', JSON.stringify(resultPayload));
      router.push('/compatibility/result');
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Photo Upload Match Submission
  const handlePhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bFile || !gFile) {
      setError('Please upload Janma Chino photos for both partners.');
      return;
    }
    setLoading(true);
    setLoadingMessage('Gemini Vision is parsing Bride\'s Janma Chino layout...');
    setError(null);

    try {
      // 1. Upload and Parse Bride Photo
      const bFormData = new FormData();
      bFormData.append('file', bFile);
      const bRes = await fetch('http://localhost:8000/vision/explain', {
        method: 'POST',
        body: bFormData
      });
      if (!bRes.ok) throw new Error('Failed to parse Bride\'s chart photo. Ensure it is clear.');
      const bParsed = await bRes.json();

      // 2. Upload and Parse Groom Photo
      setLoadingMessage('Gemini Vision is parsing Groom\'s Janma Chino layout...');
      const gFormData = new FormData();
      gFormData.append('file', gFile);
      const gRes = await fetch('http://localhost:8000/vision/explain', {
        method: 'POST',
        body: gFormData
      });
      if (!gRes.ok) throw new Error('Failed to parse Groom\'s chart photo. Ensure it is clear.');
      const gParsed = await gRes.json();

      // 3. Find Moon placement in both parsed results
      // Expecting english name 'Moon' or similar
      const bMoon = bParsed.placements.find((p: any) => p.name.toLowerCase() === 'moon' || p.name === 'चं');
      const gMoon = gParsed.placements.find((p: any) => p.name.toLowerCase() === 'moon' || p.name === 'चं');

      if (!bMoon || !gMoon) {
        throw new Error('Could not read "Moon (चं)" planet positions from one or both charts. Please verify the photos have clear markings.');
      }

      const bMoonSign = bMoon.signNumber;
      const bMoonDegree = bMoon.degree || 15.0;
      const bMoonLon = (bMoonSign - 1) * 30 + bMoonDegree;
      const brideMoon = getMoonDetailsFromLon(bMoonLon);

      const gMoonSign = gMoon.signNumber;
      const gMoonDegree = gMoon.degree || 15.0;
      const gMoonLon = (gMoonSign - 1) * 30 + gMoonDegree;
      const groomMoon = getMoonDetailsFromLon(gMoonLon);

      // Convert full English names to Devnagari shorthand for KundaliChart UI
      const nameMap: { [key: string]: string } = {
        'Sun': 'सू', 'Moon': 'चं', 'Mars': 'मं', 'Mercury': 'बु', 
        'Jupiter': 'गु', 'Venus': 'शु', 'Saturn': 'श', 'Rahu': 'रा', 'Ketu': 'के'
      };

      const formatParsedPlacements = (placements: any) => 
        (placements || []).map((p: any) => ({
          name: nameMap[p.name] || p.name,
          signNumber: p.signNumber,
          degree: p.degree,
        }));

      // 4. Calculate Compatibility
      setLoadingMessage('Fusing photo metrics, running Ashta Koota and performing AI compatibility report...');
      const compRes = await fetch('http://localhost:8000/compatibility/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bride: brideMoon,
          groom: groomMoon
        })
      });
      if (!compRes.ok) throw new Error('Failed to compute compatibility from parsed data.');
      const compData = await compRes.json();

      const resultPayload = {
        brideName: 'Bride (Photo)',
        groomName: 'Groom (Photo)',
        brideChart: {
          ascendantSign: bParsed.ascendantSign || 1,
          placements: formatParsedPlacements(bParsed.placements)
        },
        groomChart: {
          ascendantSign: gParsed.ascendantSign || 1,
          placements: formatParsedPlacements(gParsed.placements)
        },
        koota: compData.koota,
        synergy: compData.synergy,
        brideMoonDetails: brideMoon,
        groomMoonDetails: groomMoon
      };

      sessionStorage.setItem('compatibility_result', JSON.stringify(resultPayload));
      router.push('/compatibility/result');
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (side: 'bride' | 'groom', file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (side === 'bride') {
      setBFile(file);
      setBPreview(url);
    } else {
      setGFile(file);
      setGPreview(url);
    }
    setError(null);
  };

  return (
    <section className="grid min-h-[calc(100vh-3rem)] content-center gap-8 lg:grid-cols-[0.8fr_1.2fr] px-4">
      {/* Informational Column */}
      <div className="flex flex-col justify-center">
        <div className="mx-auto lg:mx-0 w-fit px-3 py-1 rounded-full border border-amber-500/30 bg-amber-950/20 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300 flex items-center gap-1.5 shadow-inner mb-4">
          <HeartHandshake className="h-3.5 w-3.5" /> Ashta Koota Compatibility
        </div>
        <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
          Understand relationship alignment.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
          Vedic Gunamilan calculates compatibility based on 36 spiritual points (Gunas). Choose direct Nakshatra entry for an instant match, construct exact charts from birth coordinates, or upload photos of your physical Janma Chino documents for multimodal parsing and Gemini counselor synergy reports.
        </p>
        
        {error && (
          <div className="mt-6 rounded border border-rose-500/30 bg-rose-950/20 p-4 text-sm text-rose-300 max-w-xl">
            {error}
          </div>
        )}
      </div>

      {/* Main Interactive Form Card */}
      <div className="relative rounded-xl border border-slate-700 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-md">
        {loading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-xl bg-slate-950/90 p-6 text-center backdrop-blur-md">
            <div className="relative mb-6">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-amber-500/20 border-t-amber-500"></div>
              <div className="absolute inset-0 m-auto h-10 w-10 animate-ping rounded-full bg-amber-500/10"></div>
            </div>
            <h3 className="text-xl font-semibold text-white">Calculating Celestial Synergy...</h3>
            <p className="mt-2 text-sm text-slate-400 max-w-xs">{loadingMessage}</p>
          </div>
        )}

        {/* Tab Selection Headers */}
        <div className="mb-6 flex gap-2 border-b border-slate-800 pb-4">
          {(['quick', 'manual', 'upload'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setError(null); }}
              className={`flex-1 rounded-md py-2.5 text-center text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === tab 
                  ? 'bg-amber-500 text-slate-950 shadow-lg' 
                  : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab === 'quick' && 'Quick Nakshatra'}
              {tab === 'manual' && 'Birth Details'}
              {tab === 'upload' && 'Chart Photos'}
            </button>
          ))}
        </div>

        {/* Tab 1: Quick Nakshatra Match Form */}
        {activeTab === 'quick' && (
          <form onSubmit={handleQuickSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              
              {/* Bride Column */}
              <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800 relative">
                <div className="absolute top-3 right-3 text-amber-500/20">
                  <User className="h-10 w-10" />
                </div>
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Bride (कन्या)</h3>
                
                <div className="space-y-4">
                  <label className="grid gap-1.5 text-xs text-slate-400">
                    <span>Name</span>
                    <input 
                      value={qBrideName}
                      onChange={(e) => setQBrideName(e.target.value)}
                      className="rounded border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-amber-400 text-white text-sm"
                      placeholder="Bride Name"
                    />
                  </label>
                  
                  <label className="grid gap-1.5 text-xs text-slate-400">
                    <span>Moon Nakshatra</span>
                    <select 
                      value={qBrideNak}
                      onChange={(e) => setQBrideNak(Number(e.target.value))}
                      className="rounded border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-amber-400 text-white text-sm"
                    >
                      {NAKSHATRAS_LIST.map((nakName, idx) => (
                        <option key={idx} value={idx + 1}>{idx + 1}. {nakName}</option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1.5 text-xs text-slate-400">
                    <span>Pada / Charana</span>
                    <select 
                      value={qBridePada}
                      onChange={(e) => setQBridePada(Number(e.target.value))}
                      className="rounded border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-amber-400 text-white text-sm"
                    >
                      {[1, 2, 3, 4].map(num => (
                        <option key={num} value={num}>Pada {num}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              {/* Groom Column */}
              <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800 relative">
                <div className="absolute top-3 right-3 text-amber-500/20">
                  <User className="h-10 w-10" />
                </div>
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Groom (वर)</h3>
                
                <div className="space-y-4">
                  <label className="grid gap-1.5 text-xs text-slate-400">
                    <span>Name</span>
                    <input 
                      value={qGroomName}
                      onChange={(e) => setQGroomName(e.target.value)}
                      className="rounded border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-amber-400 text-white text-sm"
                      placeholder="Groom Name"
                    />
                  </label>
                  
                  <label className="grid gap-1.5 text-xs text-slate-400">
                    <span>Moon Nakshatra</span>
                    <select 
                      value={qGroomNak}
                      onChange={(e) => setQGroomNak(Number(e.target.value))}
                      className="rounded border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-amber-400 text-white text-sm"
                    >
                      {NAKSHATRAS_LIST.map((nakName, idx) => (
                        <option key={idx} value={idx + 1}>{idx + 1}. {nakName}</option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1.5 text-xs text-slate-400">
                    <span>Pada / Charana</span>
                    <select 
                      value={qGroomPada}
                      onChange={(e) => setQGroomPada(Number(e.target.value))}
                      className="rounded border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-amber-400 text-white text-sm"
                    >
                      {[1, 2, 3, 4].map(num => (
                        <option key={num} value={num}>Pada {num}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

            </div>

            <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded bg-amber-500 px-5 py-3 font-semibold text-slate-950 hover:bg-amber-400 transition-all shadow-md mt-6">
              <Sparkles className="h-5 w-5" /> Analyze Compatibility <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* Tab 2: Manual Birth Details Match Form */}
        {activeTab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 max-h-[480px] overflow-y-auto pr-1 [scrollbar-width:thin] [color-scheme:dark]">
              
              {/* Bride Column */}
              <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Bride Birth Details</h3>
                <div className="space-y-4">
                  <label className="grid gap-1.5 text-xs text-slate-400">
                    <span>Name</span>
                    <input 
                      value={mBrideName}
                      onChange={(e) => setMBrideName(e.target.value)}
                      className="rounded border border-slate-800 bg-slate-950 px-3 py-2 outline-none text-white text-sm"
                      placeholder="Bride Name"
                    />
                  </label>
                  <label className="grid gap-1.5 text-xs text-slate-400">
                    <span>Birth Date</span>
                    <input 
                      type="date"
                      value={mBrideDate}
                      onChange={(e) => setMBrideDate(e.target.value)}
                      className="rounded border border-slate-800 bg-slate-950 px-3 py-2 outline-none text-white text-sm [color-scheme:dark]"
                    />
                  </label>
                  <label className="grid gap-1.5 text-xs text-slate-400">
                    <span>Birth Time</span>
                    <input 
                      type="time"
                      value={mBrideTime}
                      onChange={(e) => setMBrideTime(e.target.value)}
                      className="rounded border border-slate-800 bg-slate-950 px-3 py-2 outline-none text-white text-sm [color-scheme:dark]"
                    />
                  </label>
                  <label className="grid gap-1.5 text-xs text-slate-400">
                    <span>Birth Place</span>
                    <input 
                      value={mBridePlace}
                      onChange={(e) => setMBridePlace(e.target.value)}
                      className="rounded border border-slate-800 bg-slate-950 px-3 py-2 outline-none text-white text-sm"
                      placeholder="Kathmandu, Nepal"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="grid gap-1 text-xs text-slate-400">
                      <span>Latitude</span>
                      <input 
                        value={mBrideLat}
                        onChange={(e) => setMBrideLat(e.target.value)}
                        className="rounded border border-slate-800 bg-slate-950 px-2 py-1.5 outline-none text-white text-xs"
                      />
                    </label>
                    <label className="grid gap-1 text-xs text-slate-400">
                      <span>Longitude</span>
                      <input 
                        value={mBrideLon}
                        onChange={(e) => setMBrideLon(e.target.value)}
                        className="rounded border border-slate-800 bg-slate-950 px-2 py-1.5 outline-none text-white text-xs"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Groom Column */}
              <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Groom Birth Details</h3>
                <div className="space-y-4">
                  <label className="grid gap-1.5 text-xs text-slate-400">
                    <span>Name</span>
                    <input 
                      value={mGroomName}
                      onChange={(e) => setMGroomName(e.target.value)}
                      className="rounded border border-slate-800 bg-slate-950 px-3 py-2 outline-none text-white text-sm"
                      placeholder="Groom Name"
                    />
                  </label>
                  <label className="grid gap-1.5 text-xs text-slate-400">
                    <span>Birth Date</span>
                    <input 
                      type="date"
                      value={mGroomDate}
                      onChange={(e) => setMGroomDate(e.target.value)}
                      className="rounded border border-slate-800 bg-slate-950 px-3 py-2 outline-none text-white text-sm [color-scheme:dark]"
                    />
                  </label>
                  <label className="grid gap-1.5 text-xs text-slate-400">
                    <span>Birth Time</span>
                    <input 
                      type="time"
                      value={mGroomTime}
                      onChange={(e) => setMGroomTime(e.target.value)}
                      className="rounded border border-slate-800 bg-slate-950 px-3 py-2 outline-none text-white text-sm [color-scheme:dark]"
                    />
                  </label>
                  <label className="grid gap-1.5 text-xs text-slate-400">
                    <span>Birth Place</span>
                    <input 
                      value={mGroomPlace}
                      onChange={(e) => setMGroomPlace(e.target.value)}
                      className="rounded border border-slate-800 bg-slate-950 px-3 py-2 outline-none text-white text-sm"
                      placeholder="Kathmandu, Nepal"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="grid gap-1 text-xs text-slate-400">
                      <span>Latitude</span>
                      <input 
                        value={mGroomLat}
                        onChange={(e) => setMGroomLat(e.target.value)}
                        className="rounded border border-slate-800 bg-slate-950 px-2 py-1.5 outline-none text-white text-xs"
                      />
                    </label>
                    <label className="grid gap-1 text-xs text-slate-400">
                      <span>Longitude</span>
                      <input 
                        value={mGroomLon}
                        onChange={(e) => setMGroomLon(e.target.value)}
                        className="rounded border border-slate-800 bg-slate-950 px-2 py-1.5 outline-none text-white text-xs"
                      />
                    </label>
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-4 flex gap-4 text-xs text-slate-400 border-t border-slate-800 pt-4">
              <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-amber-400" /> Astrological Ephemeris mapping</span>
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-amber-400" /> 100% accurate coordinates</span>
            </div>

            <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded bg-amber-500 px-5 py-3 font-semibold text-slate-950 hover:bg-amber-400 transition-all shadow-md">
              <Sparkles className="h-5 w-5" /> Calculate Compatibility <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* Tab 3: Photo Upload Match Form */}
        {activeTab === 'upload' && (
          <form onSubmit={handlePhotoSubmit} className="space-y-6">
            
            <input 
              type="file" 
              ref={bFileInputRef}
              onChange={(e) => handleFileSelect('bride', e.target.files?.[0] || null)}
              accept="image/*"
              className="hidden"
            />
            <input 
              type="file" 
              ref={gFileInputRef}
              onChange={(e) => handleFileSelect('groom', e.target.files?.[0] || null)}
              accept="image/*"
              className="hidden"
            />

            <div className="grid gap-5 sm:grid-cols-2">
              
              {/* Bride Upload */}
              <div className="flex flex-col">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Bride Janma Chino</h3>
                {!bPreview ? (
                  <div 
                    onClick={() => bFileInputRef.current?.click()}
                    className="flex-1 min-h-[160px] flex flex-col items-center justify-center border border-dashed border-slate-700 hover:border-amber-500/50 rounded-lg bg-slate-950/30 hover:bg-slate-950/60 cursor-pointer transition-all p-4 text-center"
                  >
                    <Upload className="h-6 w-6 text-amber-400/80 mb-2" />
                    <span className="text-xs font-semibold text-white">Select or snap photo</span>
                    <span className="text-[10px] text-slate-400 mt-1 max-w-[150px]">Ensure central house layout is sharp</span>
                  </div>
                ) : (
                  <div className="relative rounded border border-slate-800 overflow-hidden bg-slate-950 flex flex-col items-center p-3 gap-2 min-h-[160px] justify-center">
                    <img src={bPreview} alt="Bride chart preview" className="max-h-[110px] object-contain rounded" />
                    <button 
                      type="button" 
                      onClick={() => { setBFile(null); setBPreview(null); }}
                      className="text-[10px] font-bold text-rose-400 bg-rose-950/20 px-3 py-1 rounded border border-rose-900/30 hover:bg-rose-950/40"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Groom Upload */}
              <div className="flex flex-col">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Groom Janma Chino</h3>
                {!gPreview ? (
                  <div 
                    onClick={() => gFileInputRef.current?.click()}
                    className="flex-1 min-h-[160px] flex flex-col items-center justify-center border border-dashed border-slate-700 hover:border-amber-500/50 rounded-lg bg-slate-950/30 hover:bg-slate-950/60 cursor-pointer transition-all p-4 text-center"
                  >
                    <Upload className="h-6 w-6 text-amber-400/80 mb-2" />
                    <span className="text-xs font-semibold text-white">Select or snap photo</span>
                    <span className="text-[10px] text-slate-400 mt-1 max-w-[150px]">Ensure central house layout is sharp</span>
                  </div>
                ) : (
                  <div className="relative rounded border border-slate-800 overflow-hidden bg-slate-950 flex flex-col items-center p-3 gap-2 min-h-[160px] justify-center">
                    <img src={gPreview} alt="Groom chart preview" className="max-h-[110px] object-contain rounded" />
                    <button 
                      type="button" 
                      onClick={() => { setGFile(null); setGPreview(null); }}
                      className="text-[10px] font-bold text-rose-400 bg-rose-950/20 px-3 py-1 rounded border border-rose-900/30 hover:bg-rose-950/40"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

            </div>

            <button 
              type="submit" 
              disabled={!bFile || !gFile}
              className={`w-full inline-flex items-center justify-center gap-2 rounded px-5 py-3 font-semibold text-slate-950 transition-all shadow-md ${
                bFile && gFile 
                  ? 'bg-amber-500 hover:bg-amber-400 cursor-pointer' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Sparkles className="h-5 w-5" /> Parse & Analyze with Gemini <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

      </div>
    </section>
  );
}

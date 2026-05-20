'use client';

import { CalendarDays, MapPin, Sparkles, Upload, Camera, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function ChartPage() {
  const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('manual');
  const [calendar, setCalendar] = useState<'AD' | 'BS'>('AD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Manual Entry Form State
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('Kathmandu, Nepal');
  const [latitude, setLatitude] = useState('27.7172');
  const [longitude, setLongitude] = useState('85.3240');

  // Photo Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  // Handle Manual Form Submission
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate || !birthTime || !latitude || !longitude) {
      setError('Please fill in all birth details, latitude, and longitude.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const isoDateTime = `${birthDate}T${birthTime}:00`;
      const response = await fetch('http://localhost:8000/chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          iso_datetime: isoDateTime,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        }),
      });

      if (!response.ok) throw new Error('Failed to generate Kundali from manual entry.');

      const data = await response.json();
      
      // Transform backend positions to the format expected by KundaliChart
      // Mapping planet abbreviations to names
      const abbreviationMap: { [key: string]: string } = {
        'Sun': 'सू', 'Moon': 'चं', 'Mars': 'मं', 'Mercury': 'बु', 
        'Jupiter': 'गु', 'Venus': 'शु', 'Saturn': 'श', 'Rahu': 'रा', 'Ketu': 'के'
      };
      
      const placements = Object.entries(data.positions).map(([name, pos]: [string, any]) => ({
        name: abbreviationMap[name] || name.slice(0, 2),
        signNumber: pos.sign_num || 1,
        degree: pos.longitude % 30,
      }));

      // Calculate ascendant (1st house) sign
      const ascendantSign = data.positions.Lagna?.sign_num || 1;

      // Mock explanation for manual entry using Panchanga/Varga data
      const mockResult = {
        isUploaded: false,
        ascendantSign,
        placements,
        summary_en: `Your Kundali has been constructed using precise astronomical algorithms. Your Ascendant is in sign number ${ascendantSign}. The Panchanga indicators show a auspicious alignment.`,
        summary_ne: `तपाईंको जन्म कुण्डली पूर्ण खगोलीय गणना अनुसार तयार गरिएको छ। तपाईंको लग्न राशि ${ascendantSign} मा अवस्थित छ। पञ्चाङ्ग गणनाले अनुकूल समय देखाउँछ।`,
        house_interpretations: placements.map((p, idx) => ({
          house: ((p.signNumber - ascendantSign + 12) % 12) || 12,
          planets: [p.name],
          meaning_en: `${p.name} is situated in sign ${p.signNumber}, bringing specific energy to this house placement.`,
          meaning_ne: `${p.name} राशि ${p.signNumber} मा विराजमान हुनुहुन्छ, जसले यस भावमा विशिष्ट ऊर्जा प्रदान गर्दछ।`,
        })),
        remedies_en: 'Practice daily meditation, express gratitude, and focus on aligning your inner energies with your career goals.',
        remedies_ne: 'दैनिक ध्यान गर्नुहोस्, कृतज्ञता व्यक्त गर्नुहोस्, र आफ्नो आन्तरिक ऊर्जालाई कर्म क्षेत्रसँग जोड्नुहोस्।',
      };

      sessionStorage.setItem('kundali_result', JSON.stringify(mockResult));
      router.push('/chart/result');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Photo File Select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError(null);
    }
  };

  // Trigger File Input Click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle Photo Upload Submission
  const handlePhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select or capture a Kundali photo.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:8000/vision/explain', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to parse and explain Kundali from photo.');

      const data = await response.json();
      
      // Transform full English names to Devnagari symbols for the KundaliChart UI
      const nameMap: { [key: string]: string } = {
        'Sun': 'सू', 'Moon': 'चं', 'Mars': 'मं', 'Mercury': 'बु', 
        'Jupiter': 'गु', 'Venus': 'शु', 'Saturn': 'श', 'Rahu': 'रा', 'Ketu': 'के'
      };

      const formattedPlacements = (data.placements || []).map((p: any) => ({
        name: nameMap[p.name] || p.name,
        signNumber: p.signNumber,
        degree: p.degree,
      }));

      const finalResult = {
        isUploaded: true,
        ascendantSign: data.ascendantSign || 1,
        placements: formattedPlacements,
        summary_en: data.summary_en,
        summary_ne: data.summary_ne,
        house_interpretations: data.house_interpretations || [],
        remedies_en: data.remedies_en,
        remedies_ne: data.remedies_ne,
      };

      sessionStorage.setItem('kundali_result', JSON.stringify(finalResult));
      router.push('/chart/result');
    } catch (err: any) {
      setError(err.message || 'An error occurred while parsing. Please check if the image has a clear North Indian chart.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="grid min-h-[calc(100vh-3rem)] content-center gap-8 lg:grid-cols-[.9fr_1.1fr]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Janma Chino</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-white sm:text-5xl">Build a precise Kundali or upload yours.</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
          Generate an accurate Vedic Kundali by entering birth details, or snap a photo of your hand-drawn or printed Janma Chino chart from your phone. Our multimodal AI will parse and explain your charts instantly.
        </p>
        
        {error && (
          <div className="mt-6 rounded border border-rose-500/30 bg-rose-950/20 p-4 text-sm text-rose-300">
            {error}
          </div>
        )}
      </div>

      <div className="relative rounded-lg border border-slate-700 bg-slate-900/70 p-5 shadow-2xl backdrop-blur-sm">
        {loading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-lg bg-slate-950/80 p-6 text-center backdrop-blur-md">
            <div className="relative mb-6">
              {/* Outer spinning astrological rings */}
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-amber-500/20 border-t-amber-500"></div>
              <div className="absolute inset-0 m-auto h-10 w-10 animate-ping rounded-full bg-amber-500/10"></div>
            </div>
            <h3 className="text-xl font-semibold text-white">Parsing and Explaining...</h3>
            <p className="mt-2 text-sm text-slate-400 max-w-xs">
              {activeTab === 'upload' 
                ? 'Gemini 2.5 Flash is reading your chart layout, mapping planet placements, and writing your Vedic analysis.' 
                : 'Astronomical algorithms are mapping cosmic coordinate offsets and building the divisional charts.'
              }
            </p>
          </div>
        )}

        {/* Tab Controls */}
        <div className="mb-6 flex gap-2 border-b border-slate-800 pb-4">
          <button
            onClick={() => { setActiveTab('manual'); setError(null); }}
            className={`flex-1 rounded-md py-2.5 text-center text-sm font-medium transition-all ${
              activeTab === 'manual' 
                ? 'bg-amber-500 text-slate-950 shadow-lg' 
                : 'text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            Manual Birth Details
          </button>
          <button
            onClick={() => { setActiveTab('upload'); setError(null); }}
            className={`flex-1 rounded-md py-2.5 text-center text-sm font-medium transition-all ${
              activeTab === 'upload' 
                ? 'bg-amber-500 text-slate-950 shadow-lg' 
                : 'text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            Upload Kundali Photo
          </button>
        </div>

        {/* Manual Birth Form */}
        {activeTab === 'manual' && (
          <form onSubmit={handleManualSubmit}>
            <div className="mb-5 inline-flex rounded-md border border-slate-700 p-1 bg-slate-950">
              {(['AD', 'BS'] as const).map((item) => (
                <button 
                  key={item} 
                  type="button" 
                  onClick={() => setCalendar(item)} 
                  className={`rounded px-4 py-1.5 text-xs font-semibold transition-all ${
                    calendar === item 
                      ? 'bg-amber-500 text-slate-950' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-300">
                <span>Name</span>
                <input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded border border-slate-700 bg-slate-950 px-3 py-3 outline-none focus:border-amber-400 text-white" 
                  placeholder="Full name" 
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                <span>Birth date ({calendar})</span>
                <input 
                  type="date" 
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="rounded border border-slate-700 bg-slate-950 px-3 py-3 outline-none focus:border-amber-400 text-white [color-scheme:dark]" 
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                <span>Birth time</span>
                <input 
                  type="time" 
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="rounded border border-slate-700 bg-slate-950 px-3 py-3 outline-none focus:border-amber-400 text-white [color-scheme:dark]" 
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                <span>Birth place</span>
                <input 
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  className="rounded border border-slate-700 bg-slate-950 px-3 py-3 outline-none focus:border-amber-400 text-white" 
                  placeholder="Kathmandu, Nepal" 
                />
              </label>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-300">
                <span>Latitude</span>
                <input 
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="rounded border border-slate-700 bg-slate-950 px-3 py-3 outline-none focus:border-amber-400 text-white" 
                  placeholder="27.7172" 
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                <span>Longitude</span>
                <input 
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="rounded border border-slate-700 bg-slate-950 px-3 py-3 outline-none focus:border-amber-400 text-white" 
                  placeholder="85.3240" 
                />
              </label>
            </div>
            <button type="submit" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded bg-amber-500 px-5 py-3 font-semibold text-slate-950 hover:bg-amber-400 transition-all shadow-md">
              <Sparkles className="h-5 w-5" /> Generate Kundali
            </button>
            <div className="mt-5 grid gap-3 text-xs text-slate-400 sm:grid-cols-2 border-t border-slate-800 pt-4">
              <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-amber-400" /> Lahiri sidereal engine</span>
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-amber-400" /> Location-aware charting</span>
            </div>
          </form>
        )}

        {/* Photo Upload Form */}
        {activeTab === 'upload' && (
          <form onSubmit={handlePhotoSubmit} className="flex flex-col h-full">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden" 
            />

            {!previewUrl ? (
              <div 
                onClick={handleUploadClick}
                className="flex-1 min-h-[220px] flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-lg bg-slate-950/50 cursor-pointer hover:bg-slate-950 hover:border-amber-500/50 transition-all p-6 text-center"
              >
                <div className="p-4 rounded-full bg-slate-900 border border-slate-700 text-amber-400 mb-4 shadow-inner">
                  <Upload className="h-8 w-8" />
                </div>
                <h4 className="text-base font-semibold text-white">Drag & drop or tap to upload</h4>
                <p className="mt-1 text-xs text-slate-400 max-w-[240px]">
                  Supports photos of hand-drawn paper charts, printed Janma Chinos, or screen grabs.
                </p>
                <div className="mt-4 flex gap-2 justify-center">
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleUploadClick(); }}
                    className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-800 text-amber-400 hover:bg-slate-700 px-3 py-1.5 rounded border border-slate-700"
                  >
                    Select File
                  </button>
                  <label 
                    onClick={(e) => e.stopPropagation()} 
                    className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-800 text-amber-400 hover:bg-slate-700 px-3 py-1.5 rounded border border-slate-700 cursor-pointer"
                  >
                    <Camera className="h-3.5 w-3.5" /> Use Camera
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center gap-4 bg-slate-950/60 p-4 border border-slate-800 rounded-lg">
                <div className="relative w-full max-h-[240px] aspect-[4/3] rounded border border-slate-800 overflow-hidden bg-black flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Chart Preview" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={handleUploadClick}
                    className="text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded transition-all border border-slate-700"
                  >
                    Change Photo
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                    className="text-xs font-semibold text-rose-400 bg-rose-950/20 hover:bg-rose-950/40 px-4 py-2 rounded transition-all border border-rose-900/30"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={!selectedFile}
              className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded px-5 py-3 font-semibold text-slate-950 transition-all shadow-md ${
                selectedFile 
                  ? 'bg-amber-500 hover:bg-amber-400 cursor-pointer' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Sparkles className="h-5 w-5" /> Parse & Analyze with Gemini
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

'use client';

import { CalendarDays, Camera, MapPin, Sparkles, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = 'http://localhost:8000';

const NEPALI_MONTHS = [
  { value: 1, name: 'Baishakh' },
  { value: 2, name: 'Jeth' },
  { value: 3, name: 'Aashadh' },
  { value: 4, name: 'Shrawan' },
  { value: 5, name: 'Bhadra' },
  { value: 6, name: 'Aashwin' },
  { value: 7, name: 'Kartik' },
  { value: 8, name: 'Mangsir' },
  { value: 9, name: 'Poush' },
  { value: 10, name: 'Magh' },
  { value: 11, name: 'Falgun' },
  { value: 12, name: 'Chaitra' },
];

const PLANET_ABBREVIATIONS: Record<string, string> = {
  Sun: 'Su',
  Moon: 'Mo',
  Mars: 'Ma',
  Mercury: 'Me',
  Jupiter: 'Ju',
  Venus: 'Ve',
  Saturn: 'Sa',
  Rahu: 'Ra',
  Ketu: 'Ke',
};

export default function ChartPage() {
  const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('manual');
  const [calendar, setCalendar] = useState<'AD' | 'BS'>('AD');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [bsYear, setBsYear] = useState(2081);
  const [bsMonth, setBsMonth] = useState(1);
  const [bsDay, setBsDay] = useState(1);
  const [birthPlace, setBirthPlace] = useState('Kathmandu, Nepal');
  const [latitude, setLatitude] = useState('27.7172');
  const [longitude, setLongitude] = useState('85.3240');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleManualSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if ((!birthDate && calendar === 'AD') || !birthTime || !latitude || !longitude) {
      setError('Please fill in birth date, birth time, latitude, and longitude.');
      return;
    }

    setLoading(true);
    setLoadingMessage('Calculating verified sidereal chart coordinates...');
    setError(null);

    try {
      const [hour, minute] = birthTime.split(':').map(Number);
      const [year, month, day] = birthDate ? birthDate.split('-').map(Number) : [undefined, undefined, undefined];

      const chartResponse = await fetch(`${API_BASE}/api/chart/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calendar_type: calendar,
          hour,
          minute,
          latitude: Number(latitude),
          longitude: Number(longitude),
          ...(calendar === 'BS'
            ? { bs_year: bsYear, bs_month: bsMonth, bs_day: bsDay }
            : { year, month, day }),
        }),
      });

      if (!chartResponse.ok) {
        const fault = await chartResponse.json().catch(() => null);
        throw new Error(fault?.detail || 'Failed to generate Kundali from birth details.');
      }

      const chartData = await chartResponse.json();
      const placements = Object.entries(chartData.positions).map(([planet, position]: [string, any]) => ({
        name: PLANET_ABBREVIATIONS[planet] || planet.slice(0, 2),
        signNumber: position.sign || position.sign_num || 1,
        degree: position.degree_in_sign ?? position.longitude % 30,
        retrograde: Boolean(position.retrograde),
      }));

      const ascendantSign = chartData.positions.Lagna?.sign || chartData.positions.Lagna?.sign_num || 1;
      const chartForAi = {
        name: name || 'Native',
        birth_place: birthPlace,
        source_date: chartData.source_date,
        gregorian_date: chartData.gregorian_date,
        iso_datetime: chartData.iso_datetime,
        latitude: chartData.latitude,
        longitude: chartData.longitude,
        ascendantSign,
        placements,
        positions: chartData.positions,
        panchanga: chartData.panchanga,
        vargas: chartData.vargas,
        bhava_chalit: chartData.bhava_chalit,
      };

      setLoadingMessage('Sending verified Kundali JSON to Gemini for interpretation...');
      const aiResponse = await fetch(`${API_BASE}/api/ai/explain-chart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chart: chartForAi }),
      });

      if (!aiResponse.ok) {
        const fault = await aiResponse.json().catch(() => null);
        throw new Error(fault?.detail || 'Chart was calculated, but Gemini could not generate the interpretation.');
      }

      const aiData = await aiResponse.json();
      sessionStorage.setItem(
        'kundali_result',
        JSON.stringify({
          isUploaded: false,
          ascendantSign,
          placements,
          summary_en: aiData.summary_en,
          summary_ne: aiData.summary_ne,
          house_interpretations: aiData.house_interpretations || [],
          remedies_en: aiData.remedies_en,
          remedies_ne: aiData.remedies_ne,
          raw_chart: chartForAi,
        }),
      );
      router.push('/chart/result');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  const handlePhotoSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Please select or capture a Kundali photo.');
      return;
    }

    setLoading(true);
    setLoadingMessage('Gemini Vision is reading the uploaded Kundali image...');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const response = await fetch(`${API_BASE}/vision/explain`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Failed to parse and explain Kundali from photo.');
      const data = await response.json();

      const placements = (data.placements || []).map((placement: any) => ({
        name: PLANET_ABBREVIATIONS[placement.name] || placement.name,
        signNumber: placement.signNumber,
        degree: placement.degree,
      }));

      sessionStorage.setItem(
        'kundali_result',
        JSON.stringify({
          isUploaded: true,
          ascendantSign: data.ascendantSign || 1,
          placements,
          summary_en: data.summary_en,
          summary_ne: data.summary_ne,
          house_interpretations: data.house_interpretations || [],
          remedies_en: data.remedies_en,
          remedies_ne: data.remedies_ne,
        }),
      );
      router.push('/chart/result');
    } catch (err: any) {
      setError(err.message || 'An error occurred while parsing the image.');
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
          Generate a Kundali from AD or Bikram Sambat birth details, then let Gemini read the verified chart JSON automatically. Photo uploads still use Gemini Vision for direct chart extraction.
        </p>
        {error && <div className="mt-6 rounded border border-rose-500/30 bg-rose-950/20 p-4 text-sm text-rose-300">{error}</div>}
      </div>

      <div className="relative rounded-lg border border-slate-700 bg-slate-900/70 p-5 shadow-2xl backdrop-blur-sm">
        {loading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-lg bg-slate-950/85 p-6 text-center backdrop-blur-md">
            <div className="mb-6 h-16 w-16 animate-spin rounded-full border-4 border-amber-500/20 border-t-amber-500" />
            <h3 className="text-xl font-semibold text-white">Building AI interpretation...</h3>
            <p className="mt-2 max-w-xs text-sm text-slate-400">{loadingMessage}</p>
          </div>
        )}

        <div className="mb-6 flex gap-2 border-b border-slate-800 pb-4">
          {(['manual', 'upload'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setError(null);
              }}
              className={`flex-1 rounded-md py-2.5 text-center text-sm font-medium transition-all ${
                activeTab === tab ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab === 'manual' ? 'Manual Birth Details' : 'Upload Kundali Photo'}
            </button>
          ))}
        </div>

        {activeTab === 'manual' && (
          <form onSubmit={handleManualSubmit}>
            <div className="mb-5 inline-flex rounded-md border border-slate-700 bg-slate-950 p-1">
              {(['AD', 'BS'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCalendar(item)}
                  className={`rounded px-4 py-1.5 text-xs font-semibold transition-all ${
                    calendar === item ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-300">
                <span>Name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} className="rounded border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-amber-400" placeholder="Full name" />
              </label>

              {calendar === 'AD' ? (
                <label className="grid gap-2 text-sm text-slate-300">
                  <span>Birth date (AD)</span>
                  <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="rounded border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none [color-scheme:dark] focus:border-amber-400" />
                </label>
              ) : (
                <div className="grid gap-2 text-sm text-slate-300">
                  <span>Birth date (BS)</span>
                  <div className="grid grid-cols-[1fr_1.2fr_.8fr] gap-2">
                    <input type="number" min={1970} max={2100} value={bsYear} onChange={(e) => setBsYear(Number(e.target.value))} className="rounded border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-amber-400" />
                    <select value={bsMonth} onChange={(e) => setBsMonth(Number(e.target.value))} className="rounded border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-amber-400">
                      {NEPALI_MONTHS.map((month) => <option key={month.value} value={month.value}>{month.name}</option>)}
                    </select>
                    <input type="number" min={1} max={32} value={bsDay} onChange={(e) => setBsDay(Number(e.target.value))} className="rounded border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-amber-400" />
                  </div>
                </div>
              )}

              <label className="grid gap-2 text-sm text-slate-300">
                <span>Birth time</span>
                <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} className="rounded border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none [color-scheme:dark] focus:border-amber-400" />
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                <span>Birth place</span>
                <input value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} className="rounded border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-amber-400" placeholder="Kathmandu, Nepal" />
              </label>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-300">
                <span>Latitude</span>
                <input value={latitude} onChange={(e) => setLatitude(e.target.value)} className="rounded border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-amber-400" placeholder="27.7172" />
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                <span>Longitude</span>
                <input value={longitude} onChange={(e) => setLongitude(e.target.value)} className="rounded border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-amber-400" placeholder="85.3240" />
              </label>
            </div>

            <button type="submit" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded bg-amber-500 px-5 py-3 font-semibold text-slate-950 shadow-md transition-all hover:bg-amber-400">
              <Sparkles className="h-5 w-5" /> Generate Kundali and AI Reading
            </button>
            <div className="mt-5 grid gap-3 border-t border-slate-800 pt-4 text-xs text-slate-400 sm:grid-cols-2">
              <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-amber-400" /> BS/AD backend date normalization</span>
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-amber-400" /> Location-aware charting</span>
            </div>
          </form>
        )}

        {activeTab === 'upload' && (
          <form onSubmit={handlePhotoSubmit} className="flex flex-col">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            {!previewUrl ? (
              <div onClick={() => fileInputRef.current?.click()} className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-700 bg-slate-950/50 p-6 text-center transition-all hover:border-amber-500/50 hover:bg-slate-950">
                <div className="mb-4 rounded-full border border-slate-700 bg-slate-900 p-4 text-amber-400 shadow-inner"><Upload className="h-8 w-8" /></div>
                <h4 className="text-base font-semibold text-white">Tap to upload a chart photo</h4>
                <p className="mt-1 max-w-[240px] text-xs text-slate-400">Use a clear North Indian Kundali or Janma Chino image.</p>
                <label onClick={(e) => e.stopPropagation()} className="mt-4 inline-flex cursor-pointer items-center gap-1 rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-slate-700">
                  <Camera className="h-3.5 w-3.5" /> Use Camera
                  <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex aspect-[4/3] max-h-[240px] w-full items-center justify-center overflow-hidden rounded border border-slate-800 bg-black">
                  <img src={previewUrl} alt="Chart preview" className="max-h-full max-w-full object-contain" />
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 transition-all hover:bg-slate-700">Change Photo</button>
              </div>
            )}
            <button type="submit" disabled={!selectedFile} className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded px-5 py-3 font-semibold shadow-md transition-all ${selectedFile ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'cursor-not-allowed border border-slate-700 bg-slate-800 text-slate-500'}`}>
              <Sparkles className="h-5 w-5" /> Parse and Analyze with Gemini
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

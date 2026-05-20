import React from 'react';

interface PlanetPlacement {
  name: string;
  signNumber: number;
  degree?: number;
  retrograde?: boolean;
}

interface ChartProps {
  ascendantSign: number;
  placements: PlanetPlacement[];
  highlightPlanet?: string;
}

export default function KundaliChart({ ascendantSign, placements, highlightPlanet }: ChartProps) {
  const houseCoordinates: { [key: number]: { x: number; y: number; labelY: number } } = {
    1: { x: 200, y: 140, labelY: 105 }, 2: { x: 130, y: 70, labelY: 45 }, 3: { x: 70, y: 130, labelY: 95 },
    4: { x: 140, y: 200, labelY: 175 }, 5: { x: 70, y: 270, labelY: 245 }, 6: { x: 130, y: 330, labelY: 305 },
    7: { x: 200, y: 260, labelY: 225 }, 8: { x: 270, y: 330, labelY: 305 }, 9: { x: 330, y: 270, labelY: 245 },
    10: { x: 260, y: 200, labelY: 175 }, 11: { x: 330, y: 130, labelY: 95 }, 12: { x: 270, y: 70, labelY: 45 },
  };
  const getHouseOfSign = (signNum: number) => ((signNum - ascendantSign + 12) % 12) || 12;
  const planetsByHouse: { [key: number]: PlanetPlacement[] } = {};
  placements.forEach((p) => {
    const house = getHouseOfSign(p.signNumber);
    planetsByHouse[house] = [...(planetsByHouse[house] || []), p];
  });

  return (
    <svg viewBox="0 0 400 400" role="img" aria-label="North Indian Kundali chart" className="h-full w-full rounded-lg border-2 border-amber-600 bg-slate-950 shadow-inner">
      <rect x="0" y="0" width="400" height="400" fill="none" stroke="#d97706" strokeWidth="2" />
      <line x1="0" y1="0" x2="400" y2="400" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
      <line x1="400" y1="0" x2="0" y2="400" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
      <line x1="200" y1="0" x2="0" y2="200" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
      <line x1="0" y1="200" x2="200" y2="400" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
      <line x1="200" y1="400" x2="400" y2="200" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
      <line x1="400" y1="200" x2="200" y2="0" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
      {Object.keys(houseCoordinates).map((houseStr) => {
        const house = Number(houseStr);
        const signValue = ((ascendantSign + house - 2) % 12) + 1;
        const coords = houseCoordinates[house];
        const bodies = planetsByHouse[house] || [];
        return (
          <g key={house}>
            <text x={coords.x} y={coords.labelY} fill="#f59e0b" fontSize="13" textAnchor="middle" className="select-none font-bold">{signValue}</text>
            {bodies.map((planet, index) => (
              <text key={`${planet.name}-${index}`} x={coords.x} y={coords.y + index * 18} fill={planet.name === highlightPlanet ? '#fef3c7' : '#f8fafc'} fontSize="15" textAnchor="middle" className="font-semibold">
                {planet.name}{planet.retrograde ? 'R' : ''}
                <title>{planet.degree !== undefined ? `${planet.degree.toFixed(2)} degrees` : planet.name}</title>
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}


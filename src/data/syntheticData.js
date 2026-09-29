// SpringSense AI - Multi-Location Hydrogeological Engine
// Includes 5 Key Regions with 5 Curated Springs each

export const DEFAULT_WEIGHTS = {
  rainfall: 25,
  slope: 20,
  geology: 20,
  fractureDensity: 20,
  landCover: 10,
  drainageProximity: 5,
};

export const GEOLOGY_TYPES = ['Charnockite', 'Gneiss', 'Quartzite', 'Granite'];

export const GEOLOGY_PERMEABILITY = {
  'Charnockite': 65,
  'Gneiss': 70,
  'Quartzite': 50,
  'Granite': 55,
};

export const LAND_COVER_TYPES = ['Dense Forest', 'Open Forest', 'Agricultural', 'Scrubland'];

export const LAND_COVER_INFILTRATION = {
  'Dense Forest': 90,
  'Open Forest': 75,
  'Agricultural': 65,
  'Scrubland': 50,
};

// 5 Key Tribal Regions in India with exact coordinates and 5 curated springs each
export const REGIONS_DATA = {
  kolli: {
    id: 'kolli',
    name: 'Kolli Hills',
    district: 'Namakkal, Tamil Nadu',
    center: [11.25, 78.35],
    zoom: 12,
    elevation: '950m – 1,380m MSL',
    tribalGroup: 'Malayali Tribal Community',
    bounds: { latMin: 11.16, latMax: 11.34, lngMin: 78.28, lngMax: 78.44 },
    springs: [
      {
        id: 'KH-01',
        name: 'Kolli Amman Sacred Grove Spring',
        lat: 11.265,
        lng: 78.342,
        elevation: 1180,
        status: 'Healthy',
        baseDischarge: 34.5,
        verificationStatus: 'Verified',
        geology: 'Charnockite',
        landCover: 'Dense Forest',
        rawFactors: { rainfall: 75, slope: 12, geologyScore: 70, fractureDensity: 68, landCoverScore: 90, drainageProximity: 65 },
        confidenceBase: 88,
      },
      {
        id: 'KH-02',
        name: 'Semmedu Tribal Village Spring',
        lat: 11.238,
        lng: 78.358,
        elevation: 1090,
        status: 'Declining',
        baseDischarge: 8.2,
        verificationStatus: 'Unverified',
        geology: 'Gneiss',
        landCover: 'Agricultural',
        rawFactors: { rainfall: 58, slope: 22, geologyScore: 65, fractureDensity: 52, landCoverScore: 65, drainageProximity: 55 },
        confidenceBase: 74,
      },
      {
        id: 'KH-03',
        name: 'Akasa Ganga Mountain Spring',
        lat: 11.285,
        lng: 78.331,
        elevation: 1240,
        status: 'Healthy',
        baseDischarge: 42.0,
        verificationStatus: 'Verified',
        geology: 'Charnockite',
        landCover: 'Dense Forest',
        rawFactors: { rainfall: 82, slope: 16, geologyScore: 72, fractureDensity: 75, landCoverScore: 88, drainageProximity: 70 },
        confidenceBase: 91,
      },
      {
        id: 'KH-04',
        name: 'Vazhaithotam Agricultural Seep',
        lat: 11.218,
        lng: 78.369,
        elevation: 980,
        status: 'Declining',
        baseDischarge: 5.4,
        verificationStatus: 'Unverified',
        geology: 'Quartzite',
        landCover: 'Agricultural',
        rawFactors: { rainfall: 52, slope: 26, geologyScore: 55, fractureDensity: 44, landCoverScore: 60, drainageProximity: 48 },
        confidenceBase: 68,
      },
      {
        id: 'KH-05',
        name: 'Periyakoil Tribal Source (Dry)',
        lat: 11.272,
        lng: 78.385,
        elevation: 1020,
        status: 'Dry',
        baseDischarge: 0.8,
        verificationStatus: 'Unverified',
        geology: 'Granite',
        landCover: 'Scrubland',
        rawFactors: { rainfall: 44, slope: 32, geologyScore: 50, fractureDensity: 35, landCoverScore: 50, drainageProximity: 40 },
        confidenceBase: 62,
      },
    ],
    interventions: [
      { id: 'INT-01', lat: 11.242, lng: 78.361, type: 'Check Dam', priority: 'High', suitabilityScore: 78, reason: 'Drainage channel upstream of Semmedu Tribal Spring', targetSpring: 'Semmedu Tribal Village Spring', slope: 14 },
      { id: 'INT-02', lat: 11.222, lng: 78.371, type: 'Recharge Pit', priority: 'High', suitabilityScore: 72, reason: 'High fracture lineaments on gentle slope near Vazhaithotam', targetSpring: 'Vazhaithotam Agricultural Seep', slope: 18 },
      { id: 'INT-03', lat: 11.269, lng: 78.381, type: 'Contour Trench', priority: 'Medium', suitabilityScore: 66, reason: 'Upper catchment slope harvesting for Periyakoil revival', targetSpring: 'Periyakoil Tribal Source', slope: 24 }
    ],
    risks: [
      { id: 'RISK-01', lat: 11.295, lng: 78.365, riskType: 'Steep Runoff & Landslide Hazard', slope: 44, reason: 'Slope exceeds 40° — avoid structural excavation', recommendation: 'Avoid or Verify before construction' },
      { id: 'RISK-02', lat: 11.205, lng: 78.345, riskType: 'Unstable Escarpment Sector', slope: 41, reason: 'Fractured steep slope prone to monsoon debris flows', recommendation: 'Avoid or Verify with technical survey' }
    ]
  },
  araku: {
    id: 'araku',
    name: 'Araku Valley',
    district: 'Alluri Sitharama Raju, Andhra Pradesh',
    center: [18.32, 82.88],
    zoom: 12,
    elevation: '900m – 1,400m MSL',
    tribalGroup: 'Konda Dora & Bagata Tribes',
    bounds: { latMin: 18.23, latMax: 18.41, lngMin: 82.79, lngMax: 82.97 },
    springs: [
      {
        id: 'AV-01',
        name: 'Chapadarai Perennial Spring',
        lat: 18.335,
        lng: 82.865,
        elevation: 1120,
        status: 'Healthy',
        baseDischarge: 38.0,
        verificationStatus: 'Verified',
        geology: 'Khondalite',
        landCover: 'Dense Forest',
        rawFactors: { rainfall: 80, slope: 14, geologyScore: 75, fractureDensity: 70, landCoverScore: 88, drainageProximity: 68 },
        confidenceBase: 89,
      },
      {
        id: 'AV-02',
        name: 'Katiki Tribal Settlement Water Point',
        lat: 18.298,
        lng: 82.895,
        elevation: 1040,
        status: 'Declining',
        baseDischarge: 6.5,
        verificationStatus: 'Unverified',
        geology: 'Gneiss',
        landCover: 'Agricultural',
        rawFactors: { rainfall: 60, slope: 24, geologyScore: 65, fractureDensity: 48, landCoverScore: 60, drainageProximity: 50 },
        confidenceBase: 72,
      },
      {
        id: 'AV-03',
        name: 'Borra Mountain Seepage Spring',
        lat: 18.280,
        lng: 82.875,
        elevation: 980,
        status: 'Healthy',
        baseDischarge: 29.0,
        verificationStatus: 'Verified',
        geology: 'Quartzite',
        landCover: 'Dense Forest',
        rawFactors: { rainfall: 72, slope: 18, geologyScore: 68, fractureDensity: 65, landCoverScore: 82, drainageProximity: 62 },
        confidenceBase: 84,
      },
      {
        id: 'AV-04',
        name: 'Padmapuram Valley Source',
        lat: 18.345,
        lng: 82.890,
        elevation: 1010,
        status: 'Declining',
        baseDischarge: 4.8,
        verificationStatus: 'Unverified',
        geology: 'Granite',
        landCover: 'Agricultural',
        rawFactors: { rainfall: 54, slope: 25, geologyScore: 55, fractureDensity: 42, landCoverScore: 62, drainageProximity: 45 },
        confidenceBase: 66,
      },
      {
        id: 'AV-05',
        name: 'Dumbriguda Hilltop Spring (Dry)',
        lat: 18.310,
        lng: 82.915,
        elevation: 1190,
        status: 'Dry',
        baseDischarge: 0.5,
        verificationStatus: 'Unverified',
        geology: 'Charnockite',
        landCover: 'Scrubland',
        rawFactors: { rainfall: 42, slope: 34, geologyScore: 50, fractureDensity: 32, landCoverScore: 48, drainageProximity: 38 },
        confidenceBase: 60,
      }
    ],
    interventions: [
      { id: 'INT-01', lat: 18.305, lng: 82.898, type: 'Check Dam', priority: 'High', suitabilityScore: 80, reason: 'Drainage gully upstream of Katiki Settlement', targetSpring: 'Katiki Tribal Settlement Water Point', slope: 15 },
      { id: 'INT-02', lat: 18.342, lng: 82.894, type: 'Recharge Pit', priority: 'High', suitabilityScore: 74, reason: 'Percolation strata on gentle terrace slope', targetSpring: 'Padmapuram Valley Source', slope: 17 },
      { id: 'INT-03', lat: 18.315, lng: 82.912, type: 'Contour Trench', priority: 'Medium', suitabilityScore: 64, reason: 'Upper ridge slope harvesting for Dumbriguda', targetSpring: 'Dumbriguda Hilltop Spring', slope: 26 }
    ],
    risks: [
      { id: 'RISK-01', lat: 18.360, lng: 82.855, riskType: 'Steep Escarpment Hazard', slope: 46, reason: 'Steep slope > 40° with debris runoff risk', recommendation: 'Avoid excavation; deploy soil bio-bunds' }
    ]
  },
  nilgiris: {
    id: 'nilgiris',
    name: 'Nilgiris Foothills',
    district: 'The Nilgiris, Tamil Nadu',
    center: [11.45, 76.75],
    zoom: 12,
    elevation: '1,200m – 2,100m MSL',
    tribalGroup: 'Toda, Kota & Kurumba Tribes',
    bounds: { latMin: 11.36, latMax: 11.54, lngMin: 76.66, lngMax: 76.84 },
    springs: [
      {
        id: 'NG-01',
        name: 'Kodanad Ridge Tribal Spring',
        lat: 11.475,
        lng: 76.765,
        elevation: 1820,
        status: 'Healthy',
        baseDischarge: 45.0,
        verificationStatus: 'Verified',
        geology: 'Charnockite',
        landCover: 'Dense Forest',
        rawFactors: { rainfall: 85, slope: 15, geologyScore: 75, fractureDensity: 78, landCoverScore: 92, drainageProximity: 72 },
        confidenceBase: 92,
      },
      {
        id: 'NG-02',
        name: 'Kotagiri Shola Stream Spring',
        lat: 11.435,
        lng: 76.785,
        elevation: 1650,
        status: 'Declining',
        baseDischarge: 9.0,
        verificationStatus: 'Unverified',
        geology: 'Gneiss',
        landCover: 'Agricultural',
        rawFactors: { rainfall: 62, slope: 23, geologyScore: 66, fractureDensity: 54, landCoverScore: 68, drainageProximity: 54 },
        confidenceBase: 76,
      },
      {
        id: 'NG-03',
        name: 'Pillur Upper Catchment Spring',
        lat: 11.415,
        lng: 76.735,
        elevation: 1420,
        status: 'Healthy',
        baseDischarge: 32.0,
        verificationStatus: 'Verified',
        geology: 'Quartzite',
        landCover: 'Dense Forest',
        rawFactors: { rainfall: 78, slope: 16, geologyScore: 70, fractureDensity: 68, landCoverScore: 84, drainageProximity: 66 },
        confidenceBase: 86,
      },
      {
        id: 'NG-04',
        name: 'Kurumba Settlement Seep',
        lat: 11.465,
        lng: 76.715,
        elevation: 1350,
        status: 'Declining',
        baseDischarge: 4.2,
        verificationStatus: 'Unverified',
        geology: 'Granite',
        landCover: 'Agricultural',
        rawFactors: { rainfall: 55, slope: 28, geologyScore: 56, fractureDensity: 45, landCoverScore: 60, drainageProximity: 46 },
        confidenceBase: 67,
      },
      {
        id: 'NG-05',
        name: 'Coonoor Valley High Source (Dry)',
        lat: 11.485,
        lng: 76.795,
        elevation: 1740,
        status: 'Dry',
        baseDischarge: 0.6,
        verificationStatus: 'Unverified',
        geology: 'Charnockite',
        landCover: 'Scrubland',
        rawFactors: { rainfall: 46, slope: 36, geologyScore: 52, fractureDensity: 34, landCoverScore: 50, drainageProximity: 40 },
        confidenceBase: 64,
      }
    ],
    interventions: [
      { id: 'INT-01', lat: 11.442, lng: 76.782, type: 'Check Dam', priority: 'High', suitabilityScore: 82, reason: 'First-order Shola drainage line near Kotagiri', targetSpring: 'Kotagiri Shola Stream Spring', slope: 16 },
      { id: 'INT-02', lat: 11.462, lng: 76.720, type: 'Recharge Pit', priority: 'High', suitabilityScore: 75, reason: 'Deep fracture recharge for Kurumba settlement', targetSpring: 'Kurumba Settlement Seep', slope: 19 },
      { id: 'INT-03', lat: 11.482, lng: 76.790, type: 'Contour Trench', priority: 'Medium', suitabilityScore: 68, reason: 'Terrace contour trenches on tea plantation slope', targetSpring: 'Coonoor Valley High Source', slope: 25 }
    ],
    risks: [
      { id: 'RISK-01', lat: 11.495, lng: 76.745, riskType: 'Steep Landslide Hazard Zone', slope: 45, reason: 'Steep slope > 40° prone to monsoon slope slip', recommendation: 'Avoid excavation; deploy vegetative bio-fencing' }
    ]
  }
};

// Generate Springshed Polygon
export function generateSpringshedPolygon(lat, lng, spreadMultiplier = 1.0) {
  const baseLat = 0.010 * spreadMultiplier;
  const baseLng = 0.012 * spreadMultiplier;
  const points = 8;
  const polygon = [];
  for (let k = 0; k < points; k++) {
    const angle = (k / points) * 2 * Math.PI;
    const rLat = (0.7 + Math.sin(k * 2.5) * 0.3) * baseLat;
    const rLng = (0.7 + Math.cos(k * 2.1) * 0.3) * baseLng;
    polygon.push([lat + rLat * Math.sin(angle), lng + rLng * Math.cos(angle)]);
  }
  polygon.push(polygon[0]);
  return polygon;
}

// Generate Grid Cells for a specific region
export function generateRegionGrid(regionKey = 'kolli') {
  const reg = REGIONS_DATA[regionKey] || REGIONS_DATA.kolli;
  const rows = 6;
  const cols = 6;
  const cellLat = (reg.bounds.latMax - reg.bounds.latMin) / rows;
  const cellLng = (reg.bounds.lngMax - reg.bounds.lngMin) / cols;

  const cells = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const lat = reg.bounds.latMin + row * cellLat + cellLat / 2;
      const lng = reg.bounds.lngMin + col * cellLng + cellLng / 2;
      const slope = 8 + ((row * 7 + col * 9) % 46);
      const rainfall = 50 + ((row * 8 + col * 5) % 40);
      const geology = GEOLOGY_TYPES[(row + col) % GEOLOGY_TYPES.length];
      const landCover = LAND_COVER_TYPES[(row * 2 + col) % LAND_COVER_TYPES.length];
      const fractureDensity = 30 + ((row * 11 + col * 7) % 55);
      const drainageProximity = 25 + ((row * 6 + col * 13) % 65);

      cells.push({
        id: `CELL-${reg.id}-${row}-${col}`,
        row, col,
        lat, lng,
        latMin: reg.bounds.latMin + row * cellLat,
        latMax: reg.bounds.latMin + (row + 1) * cellLat,
        lngMin: reg.bounds.lngMin + col * cellLng,
        lngMax: reg.bounds.lngMin + (col + 1) * cellLng,
        geology,
        landCover,
        rawFactors: {
          rainfall,
          slope,
          geologyScore: GEOLOGY_PERMEABILITY[geology] || 65,
          fractureDensity,
          landCoverScore: LAND_COVER_INFILTRATION[landCover] || 65,
          drainageProximity,
        },
        confidenceBase: 65 + ((row + col) * 4) % 30,
      });
    }
  }
  return cells;
}

// Calculate Recharge Score
export function calculateRechargeScore(factors, weights = DEFAULT_WEIGHTS) {
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0) || 100;
  const rainfallTerm = (factors.rainfall || 50) * (weights.rainfall || 0);
  const slopeTerm = Math.max(0, 100 - (factors.slope || 20)) * (weights.slope || 0);
  const geologyTerm = (factors.geologyScore || 60) * (weights.geology || 0);
  const fractureTerm = (factors.fractureDensity || 50) * (weights.fractureDensity || 0);
  const landCoverTerm = (factors.landCoverScore || 60) * (weights.landCover || 0);
  const drainageTerm = (factors.drainageProximity || 50) * (weights.drainageProximity || 0);

  const weightedSum = (rainfallTerm + slopeTerm + geologyTerm + fractureTerm + landCoverTerm + drainageTerm) / totalWeight;
  return Math.round(Math.min(100, Math.max(0, weightedSum)));
}

export function getSuitabilityClass(score) {
  if (score >= 65) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

// Evaluate entire system dynamically
export function evaluateAllData(regionKey, springsList, rawGridCells, weights) {
  const reg = REGIONS_DATA[regionKey] || REGIONS_DATA.kolli;

  // 1. Grid Cells
  const dynamicCells = rawGridCells.map(cell => {
    const rechargeScore = calculateRechargeScore(cell.rawFactors, weights);
    const suitabilityClass = getSuitabilityClass(rechargeScore);
    const isRisk = cell.rawFactors.slope > 38;
    const riskType = isRisk ? 'Steep Slope & Landslide Hazard' : null;

    return {
      ...cell,
      factors: cell.rawFactors,
      rechargeScore,
      suitabilityClass,
      confidence: cell.confidenceBase,
      isRisk,
      riskType,
    };
  });

  // 2. Springs
  const dynamicSprings = springsList.map(s => {
    const rechargeScore = calculateRechargeScore(s.rawFactors, weights);
    const suitabilityClass = getSuitabilityClass(rechargeScore);
    const discharge = s.baseDischarge;

    const trend = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((m, idx) => {
      const monthFactor = s.status === 'Healthy' ? 0.9 + idx * 0.04
        : s.status === 'Declining' ? 1.2 - idx * 0.08
        : 0.5 - idx * 0.05;
      return {
        month: m,
        discharge: Math.max(0, parseFloat((discharge * monthFactor).toFixed(1))),
      };
    });

    const springshed = generateSpringshedPolygon(s.lat, s.lng, 0.9 + (rechargeScore / 100) * 0.4);

    return {
      ...s,
      currentDischarge: discharge,
      trend,
      factors: s.rawFactors,
      rechargeScore,
      suitabilityClass,
      confidence: s.confidenceBase,
      springshed,
    };
  });

  return {
    cells: dynamicCells,
    springs: dynamicSprings,
    interventions: reg.interventions,
    risks: reg.risks,
  };
}

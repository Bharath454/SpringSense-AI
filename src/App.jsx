import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polygon, Rectangle, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartTip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import {
  Droplets, Layers, ShieldAlert, CheckCircle2,
  Compass, MapPin, RefreshCw, AlertTriangle
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

import {
  DEFAULT_WEIGHTS,
  REGIONS_DATA,
  generateRegionGrid,
  evaluateAllData
} from './data/syntheticData.js';

// ============================================================
// CONSTANTS & COLORS
// ============================================================
const TAB_OVERVIEW = 'overview';
const TAB_INTERVENTIONS = 'interventions';
const TAB_FIELD = 'field';
const TAB_FEEDBACK = 'feedback';

const SUITABILITY_COLORS = { High: '#059669', Medium: '#d97706', Low: '#e11d48' };
const SPRING_STATUS_COLOR = { Healthy: '#059669', Declining: '#d97706', Dry: '#e11d48' };

// ============================================================
// MAP CONTROLLER (AUTO-FLY TO SELECTED LOCATION & GPS PICKER)
// ============================================================
function MapController({ center, zoom, pickingGPS, onPickGPS }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 1.0 });
  }, [center, zoom, map]);

  useMapEvents({
    click(e) {
      if (pickingGPS) onPickGPS(e.latlng);
    }
  });
  return null;
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type || ''}`}>
          <div className="toast-title">{t.title}</div>
          <div>{t.message}</div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// "HOW IT WORKS" MODAL (SIH 8-STAGE WORKFLOW)
// ============================================================
function HowItWorksModal({ onClose }) {
  const steps = [
    { num: 1, title: 'Environmental Data Ingestion', desc: 'Rainfall, Digital Elevation Model (DEM), geology, slope, fracture lineaments' },
    { num: 2, title: 'Data Processing & Spatial Grid', desc: 'Normalized raster cell preprocessing across study area' },
    { num: 3, title: 'Recharge-Zone Prediction', desc: 'Proposed Random Forest + XGBoost prediction pipeline' },
    { num: 4, title: 'Springshed Catchment Mapping', desc: 'Hydrogeological recharge boundary delineation for each spring' },
    { num: 5, title: 'Intervention Planning', desc: 'Recommends Check Dams, Recharge Pits & Contour Trenches' },
    { num: 6, title: 'Risk & Hazard Detection', desc: 'Flags steep slopes and unstable terrain as “Avoid or Verify”' },
    { num: 7, title: 'Field Validation & GPS Telemetry', desc: 'Ranger on-site verification with Online & Offline mode support' },
    { num: 8, title: 'Continuous Model Improvement', desc: 'Ground-truth updates boost prediction confidence and calibration' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--slate-900)' }}>How SpringSense AI Works</div>
          <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: 11 }} onClick={onClose}>✕</button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--slate-500)', marginBottom: 14 }}>
          SIH 2026 Decision Support Workflow for Tribal Spring Revival.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '360px', overflowY: 'auto' }}>
          {steps.map(s => (
            <div key={s.num} style={{ display: 'flex', gap: 10, padding: '8px 10px', background: 'var(--slate-50)', borderRadius: 8, border: '1px solid var(--slate-200)' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                {s.num}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate-800)' }}>{s.title}</div>
                <div style={{ fontSize: 11, color: 'var(--slate-500)', marginTop: 1 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn btn-primary btn-full" style={{ marginTop: 16 }} onClick={onClose}>Close Workflow</button>
      </div>
    </div>
  );
}

// ============================================================
// SPRING DETAIL VIEW
// ============================================================
function SpringDetailView({ spring, onBack }) {
  if (!spring) return null;

  const factorData = [
    { name: 'Rainfall', value: spring.factors.rainfall, displayValue: spring.factors.rainfall },
    { name: 'Slope', value: spring.factors.slope, displayValue: Math.max(0, 100 - spring.factors.slope) },
    { name: 'Geology', value: spring.factors.geologyScore, displayValue: spring.factors.geologyScore },
    { name: 'Fractures', value: spring.factors.fractureDensity, displayValue: spring.factors.fractureDensity },
    { name: 'Land Cover', value: spring.factors.landCoverScore, displayValue: spring.factors.landCoverScore },
  ];

  const factorColors = ['#1d4ed8', '#059669', '#7c3aed', '#d97706', '#0284c7'];

  return (
    <div>
      <button className="back-link" onClick={onBack}>← Back to Springs Dashboard</button>
      
      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--slate-900)' }}>{spring.name}</div>
      <div style={{ fontSize: 11, color: 'var(--slate-500)', marginBottom: 10 }}>
        ID: <strong>{spring.id}</strong> · {spring.geology} · {spring.elevation} m MSL
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <span className={`badge badge-${spring.status}`}>{spring.status}</span>
        <span className="badge badge-Verified">{spring.verificationStatus}</span>
      </div>

      <div className="score-badge-card">
        <div className="score-big">{spring.rechargeScore}</div>
        <div className="score-lbl">Recharge Suitability Score (0–100)</div>
        <div style={{ fontSize: 12, fontWeight: 800, color: SUITABILITY_COLORS[spring.suitabilityClass], marginTop: 2 }}>
          {spring.suitabilityClass} Suitability
        </div>
      </div>

      <div className="detail-row">
        <span className="detail-lbl">Model Prediction Confidence</span>
        <span className="detail-val" style={{ color: 'var(--primary)' }}>{spring.confidence}%</span>
      </div>
      <div className="detail-row"><span className="detail-lbl">Current Measured Discharge</span><span className="detail-val">{spring.currentDischarge} L/min</span></div>
      <div className="detail-row"><span className="detail-lbl">Catchment Land Cover</span><span className="detail-val">{spring.landCover}</span></div>
      <div className="detail-row"><span className="detail-lbl">GPS Coordinates</span><span className="detail-val">{spring.lat.toFixed(4)}°N, {spring.lng.toFixed(4)}°E</span></div>

      <div className="section-title">6-Month Discharge Hydrograph</div>
      <div style={{ background: 'var(--slate-50)', padding: '10px 6px 4px 0', borderRadius: 8, border: '1px solid var(--slate-200)', marginBottom: 14 }}>
        <ResponsiveContainer width="100%" height={110}>
          <LineChart data={spring.trend} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <RechartTip contentStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="discharge" stroke="#1d4ed8" strokeWidth={2.5} dot={{ r: 2.5 }} name="L/min" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="section-title">Model Factors (Why this Score?)</div>
      <div style={{ fontSize: 11, color: 'var(--slate-400)', marginBottom: 6 }}>
        Environmental factor contributions driving predictive score:
      </div>
      <div style={{ background: 'var(--slate-50)', padding: '10px 8px 4px 0', borderRadius: 8, border: '1px solid var(--slate-200)', marginBottom: 12 }}>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={factorData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={80} />
            <RechartTip contentStyle={{ fontSize: 11 }} formatter={(v) => `${v.toFixed(0)} / 100`} />
            <Bar dataKey="displayValue" name="Score" radius={[0, 4, 4, 0]}>
              {factorData.map((_, i) => <Cell key={i} fill={factorColors[i % factorColors.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: 8, padding: '10px 12px', fontSize: 11, color: 'var(--slate-600)', lineHeight: 1.4 }}>
        <strong>Model Note:</strong> Prototype scoring represents the proposed AI prediction workflow. Random Forest/XGBoost will be trained and validated using real environmental and field datasets.
      </div>
    </div>
  );
}

// ============================================================
// TAB 1: OVERVIEW DASHBOARD
// ============================================================
function OverviewTab({
  region,
  springs,
  risks,
  layers,
  setLayers,
  minConfidence,
  setMinConfidence,
  onSelectSpring
}) {
  const healthy = springs.filter(s => s.status === 'Healthy').length;
  const highRecharge = springs.filter(s => s.rechargeScore >= 65).length;
  const verified = springs.filter(s => s.verificationStatus === 'Verified').length;

  return (
    <div>
      <div className="panel-header-block">
        <div className="panel-title">{region.name} Springshed Dashboard</div>
        <div className="panel-desc">{region.district} · {region.tribalGroup} ({region.elevation})</div>
      </div>

      {/* KPI SUMMARY CARDS */}
      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-header">
            <span className="stat-label">Total Springs</span>
            <Droplets size={14} color="var(--primary)" />
          </div>
          <div className="stat-val">{springs.length}</div>
          <div className="stat-sub">{healthy} Healthy · {springs.length - healthy} Declining/Dry</div>
        </div>
        <div className="stat-box">
          <div className="stat-header">
            <span className="stat-label">High Recharge</span>
            <CheckCircle2 size={14} color="var(--emerald)" />
          </div>
          <div className="stat-val" style={{ color: 'var(--emerald)' }}>{highRecharge}</div>
          <div className="stat-sub">Score ≥ 65</div>
        </div>
        <div className="stat-box">
          <div className="stat-header">
            <span className="stat-label">Risk Sites</span>
            <ShieldAlert size={14} color="var(--rose)" />
          </div>
          <div className="stat-val" style={{ color: 'var(--rose)' }}>{risks.length}</div>
          <div className="stat-sub">Hazard warnings</div>
        </div>
        <div className="stat-box">
          <div className="stat-header">
            <span className="stat-label">Field Verified</span>
            <CheckCircle2 size={14} color="var(--primary)" />
          </div>
          <div className="stat-val" style={{ color: 'var(--primary)' }}>{verified}</div>
          <div className="stat-sub">Ground-truthed</div>
        </div>
      </div>

      {/* LAYER CONTROLS */}
      <div className="section-title">GIS Map Layers</div>
      <div className="layer-list">
        {[
          { key: 'suitability', label: 'Recharge Suitability Grid (High/Med/Low)', color: '#059669' },
          { key: 'springs', label: 'Springs & Springshed Polygons', color: '#1d4ed8' },
          { key: 'interventions', label: 'Suggested Recharge Structures', color: '#7c3aed' },
          { key: 'risks', label: 'Hazard & Steep Runoff Areas', color: '#e11d48' },
        ].map(l => (
          <label key={l.key} className="layer-item">
            <input
              type="checkbox"
              checked={layers[l.key]}
              onChange={() => setLayers(prev => ({ ...prev, [l.key]: !prev[l.key] }))}
            />
            <span className="color-dot" style={{ background: l.color }} />
            {l.label}
          </label>
        ))}
      </div>

      {/* CONFIDENCE SLIDER */}
      <div className="slider-container">
        <div className="slider-header">
          <span>Minimum Confidence Threshold</span>
          <span className="slider-val">{minConfidence}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={85}
          value={minConfidence}
          onChange={e => setMinConfidence(Number(e.target.value))}
        />
        <div style={{ fontSize: 10, color: 'var(--slate-400)', marginTop: 4 }}>
          Hides prediction cells below confidence threshold
        </div>
      </div>

      {/* 5 SPRINGS LIST */}
      <div className="section-title">5 Key Springs in {region.name}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {springs.map(s => (
          <div
            key={s.id}
            onClick={() => onSelectSpring(s)}
            className="clean-card"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', margin: 0, cursor: 'pointer' }}
          >
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--slate-800)' }}>{s.name}</div>
              <div style={{ fontSize: 11, color: 'var(--slate-500)', marginTop: 2 }}>
                {s.id} · Score: <strong style={{ color: 'var(--primary)' }}>{s.rechargeScore}</strong> · Discharge: {s.currentDischarge} L/min
              </div>
            </div>
            <span className={`badge badge-${s.status}`} style={{ fontSize: 10 }}>{s.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// TAB 2: INTERVENTIONS & RISKS
// ============================================================
function InterventionsTab({ interventions, risks }) {
  return (
    <div>
      <div className="panel-header-block">
        <div className="panel-title">Recommended Recharge Interventions</div>
        <div className="panel-desc">Ranked candidate locations based on terrain slope, drainage proximity, and geology.</div>
      </div>

      <div style={{ background: 'var(--amber-subtle)', border: '1px solid var(--amber-border)', borderRadius: 8, padding: '8px 12px', marginBottom: 14, fontSize: 11, color: '#92400e' }}>
        ⚠ Indicative recommendation — field validation required.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {interventions.map(site => (
          <div key={site.id} className="clean-card" style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--slate-900)' }}>{site.type}</div>
              <span className="badge" style={{ background: site.priority === 'High' ? 'var(--rose-subtle)' : 'var(--amber-subtle)', color: site.priority === 'High' ? 'var(--rose)' : '#b45309', fontSize: 10 }}>
                {site.priority} Priority
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--slate-700)', marginBottom: 4 }}>
              <strong>Target Spring:</strong> {site.targetSpring}
            </div>
            <div style={{ fontSize: 11, color: 'var(--slate-500)', marginBottom: 6 }}>
              {site.reason}
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--slate-500)' }}>
              <span>Suitability Score: <strong>{site.suitabilityScore}</strong></span>
              <span>Slope: <strong>{site.slope}°</strong></span>
            </div>
          </div>
        ))}
      </div>

      <div className="section-title" style={{ marginTop: 18 }}>Risk Detection (Hazard Zones)</div>
      <div style={{ background: 'var(--rose-subtle)', border: '1px solid var(--rose-border)', borderRadius: 8, padding: '8px 12px', marginBottom: 10, fontSize: 11, color: 'var(--rose)' }}>
        Risk indication from demo terrain data; technical field assessment required.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {risks.map(r => (
          <div key={r.id} className="clean-card" style={{ background: 'var(--rose-subtle)', borderColor: 'var(--rose-border)', margin: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--rose)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
              <AlertTriangle size={14} /> {r.riskType}
            </div>
            <div style={{ fontSize: 11, color: '#9f1239', marginBottom: 4 }}>{r.reason}</div>
            <div style={{ fontSize: 10, color: 'var(--slate-600)', background: 'rgba(255,255,255,0.7)', padding: '4px 8px', borderRadius: 4 }}>
              <strong>Action:</strong> {r.recommendation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// TAB 3: FIELD VALIDATION
// ============================================================
function FieldValidationTab({ springs, onSubmitVerification, toastFn, onPickMapGPS, gpsLoc }) {
  const [offlineMode, setOfflineMode] = useState(false);
  const [selectedSpringId, setSelectedSpringId] = useState('');
  const [discharge, setDischarge] = useState('');
  const [notes, setNotes] = useState('');
  const [verStatus, setVerStatus] = useState('Verified');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [records, setRecords] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ss_focus_records') || '[]'); } catch { return []; }
  });

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setPhotoPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!selectedSpringId) {
      toastFn({ title: 'Missing Spring', message: 'Please select a spring.', type: 'warning' });
      return;
    }

    const rec = {
      id: Date.now(),
      springId: selectedSpringId,
      springName: springs.find(s => s.id === selectedSpringId)?.name || selectedSpringId,
      discharge: parseFloat(discharge) || 0,
      notes,
      verStatus,
      gpsLoc,
      timestamp: new Date().toLocaleTimeString(),
      syncStatus: offlineMode ? 'Pending Sync' : 'Synced',
    };

    const updated = [rec, ...records];
    setRecords(updated);
    localStorage.setItem('ss_focus_records', JSON.stringify(updated));
    onSubmitVerification(selectedSpringId, rec);
    setSelectedSpringId(''); setDischarge(''); setNotes(''); setPhotoPreview(null);
  };

  const handleSyncAll = () => {
    const updated = records.map(r => ({ ...r, syncStatus: 'Synced' }));
    setRecords(updated);
    localStorage.setItem('ss_focus_records', JSON.stringify(updated));
    toastFn({ title: 'Sync Complete', message: 'All pending offline records are now synced.', type: 'success' });
  };

  return (
    <div>
      <div className="panel-header-block">
        <div className="panel-title">Field Data Verification</div>
        <div className="panel-desc">Ground-truth on-site spring observations to calibrate model predictions.</div>
      </div>

      {/* OFFLINE MODE TOGGLE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate-800)' }}>Offline Mode</div>
          <div style={{ fontSize: 10, color: 'var(--slate-500)' }}>
            {offlineMode ? 'Records saved as Pending Sync' : 'Records saved as Synced'}
          </div>
        </div>
        <input
          type="checkbox"
          checked={offlineMode}
          onChange={e => setOfflineMode(e.target.checked)}
          style={{ width: 16, height: 16, accentColor: 'var(--primary)', cursor: 'pointer' }}
        />
      </div>

      <div className="form-field">
        <label className="form-lbl">Select Spring *</label>
        <select className="form-input" value={selectedSpringId} onChange={e => setSelectedSpringId(e.target.value)}>
          <option value="">— Choose Spring —</option>
          {springs.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
        </select>
      </div>

      <div className="form-field">
        <label className="form-lbl">GPS Location</label>
        <div style={{ display: 'flex', gap: 6 }}>
          <input className="form-input" value={gpsLoc} readOnly placeholder="Click map or use GPS" />
          <button className="btn btn-secondary" onClick={onPickMapGPS} style={{ whiteSpace: 'nowrap' }}>
            <MapPin size={12} /> Use Map Location
          </button>
        </div>
      </div>

      <div className="form-field">
        <label className="form-lbl">Discharge Reading (L/min)</label>
        <input type="number" className="form-input" value={discharge} onChange={e => setDischarge(e.target.value)} placeholder="e.g. 18.5" min={0} />
      </div>

      <div className="form-field">
        <label className="form-lbl">Photo Upload</label>
        <label className="photo-upload-label" htmlFor="photo-field-upload">
          📷 Click to upload field photo
        </label>
        <input id="photo-field-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
        {photoPreview && <img src={photoPreview} alt="Field preview" className="img-preview" />}
      </div>

      <div className="form-field">
        <label className="form-lbl">Field Notes</label>
        <textarea className="form-input" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Condition, seepage notes..." />
      </div>

      <div className="form-field">
        <label className="form-lbl">Verification Status</label>
        <select className="form-input" value={verStatus} onChange={e => setVerStatus(e.target.value)}>
          <option value="Verified">Verified</option>
          <option value="Unverified">Unverified</option>
          <option value="Needs Review">Needs Review</option>
        </select>
      </div>

      <button className="btn btn-primary btn-full" onClick={handleSubmit}>
        Submit Field Record {offlineMode ? '(Save Offline)' : ''}
      </button>

      {records.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div className="section-title" style={{ margin: 0 }}>Field Records ({records.length})</div>
            {records.some(r => r.syncStatus === 'Pending Sync') && (
              <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: 10 }} onClick={handleSyncAll}>
                Sync Pending
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {records.map(r => (
              <div key={r.id} className="clean-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', margin: 0 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate-800)' }}>{r.springName}</div>
                  <div style={{ fontSize: 10, color: 'var(--slate-400)' }}>{r.timestamp} · {r.discharge} L/min · {r.verStatus}</div>
                </div>
                <span className="badge" style={{ background: r.syncStatus === 'Synced' ? 'var(--emerald-subtle)' : 'var(--amber-subtle)', color: r.syncStatus === 'Synced' ? 'var(--emerald)' : '#b45309', fontSize: 10 }}>
                  {r.syncStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TAB 4: FEEDBACK LOOP
// ============================================================
function FeedbackTab({ feedbackEvents }) {
  return (
    <div>
      <div className="panel-header-block">
        <div className="panel-title">Prototype Feedback Loop</div>
        <div className="panel-desc">Demonstrates how ground-truth field data updates predictions and confidence.</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, margin: '12px 0' }}>
        {[
          'Field Observation',
          'Validation',
          'Prediction Update',
          'Improved Confidence'
        ].map((step, idx, arr) => (
          <React.Fragment key={step}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--primary-subtle)', borderRadius: 8, fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>
              <span>{['📋', '✔', '🔄', '📈'][idx]}</span>
              <span>{step}</span>
            </div>
            {idx < arr.length - 1 && <div style={{ textAlign: 'center', color: 'var(--slate-400)', fontSize: 12 }}>↓</div>}
          </React.Fragment>
        ))}
      </div>

      <div style={{ fontSize: 11, color: 'var(--slate-500)', fontStyle: 'italic', margin: '10px 0 16px 0', textAlign: 'center' }}>
        Prototype feedback loop: scoring represents the workflow without claim of real-time model retraining.
      </div>

      <div className="section-title">Feedback Audit Trail</div>
      {feedbackEvents.length === 0 ? (
        <div style={{ fontSize: 11, color: 'var(--slate-400)', textAlign: 'center', padding: '16px 0' }}>
          Submit a record in "Field Validation" to view feedback updates.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {feedbackEvents.map((ev, i) => (
            <div key={i} style={{ background: 'var(--emerald-subtle)', border: '1px solid var(--emerald-border)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--emerald)' }}>✓ Model updated with new field data</div>
              <div style={{ fontSize: 11, color: 'var(--slate-800)', marginTop: 2 }}>{ev.springName}</div>
              <div style={{ fontSize: 10, color: 'var(--slate-500)', marginTop: 2 }}>
                Confidence: {ev.oldConf}% → <strong>{ev.newConf}%</strong> | Score: {ev.oldScore} → <strong>{ev.newScore}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN ROOT COMPONENT
// ============================================================
export default function App() {
  // Location / Region Switcher State
  const [selectedRegionKey, setSelectedRegionKey] = useState('kolli');
  const activeRegion = REGIONS_DATA[selectedRegionKey] || REGIONS_DATA.kolli;

  // Active Region Springs and Grids
  const [springsBase, setSpringsBase] = useState(() => activeRegion.springs);
  const [rawGridCells, setRawGridCells] = useState(() => generateRegionGrid('kolli'));

  // Switch Location Handler
  const handleLocationChange = (newRegionKey) => {
    setSelectedRegionKey(newRegionKey);
    const newReg = REGIONS_DATA[newRegionKey];
    setSpringsBase(newReg.springs);
    setRawGridCells(generateRegionGrid(newRegionKey));
    setSelectedSpring(null);
    addToast({ title: 'Location Switched', message: `Target area changed to ${newReg.name} (${newReg.district}).`, type: 'success' });
  };

  const [selectedSpring, setSelectedSpring] = useState(null);
  const [activeTab, setActiveTab] = useState(TAB_OVERVIEW);
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [minConfidence, setMinConfidence] = useState(40);
  const [layers, setLayers] = useState({ suitability: true, springs: true, risks: true, interventions: true });
  
  const [pickingGPS, setPickingGPS] = useState(false);
  const [fieldGPS, setFieldGPS] = useState('');
  const [toasts, setToasts] = useState([]);
  const [showHow, setShowHow] = useState(false);
  const [feedbackEvents, setFeedbackEvents] = useState([]);

  const addToast = useCallback((t) => {
    const id = Date.now();
    setToasts(prev => [{ ...t, id }, ...prev.slice(0, 2)]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4000);
  }, []);

  const evaluatedData = useMemo(() => {
    return evaluateAllData(selectedRegionKey, springsBase, rawGridCells, weights);
  }, [selectedRegionKey, springsBase, rawGridCells, weights]);

  const activeSelectedSpring = useMemo(() => {
    if (!selectedSpring) return null;
    return evaluatedData.springs.find(s => s.id === selectedSpring.id) || selectedSpring;
  }, [selectedSpring, evaluatedData.springs]);

  const handlePickGPS = useCallback((latlng) => {
    setFieldGPS(`${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`);
    setPickingGPS(false);
    addToast({ title: 'GPS Location Captured', message: `${latlng.lat.toFixed(4)}°N, ${latlng.lng.toFixed(4)}°E`, type: 'success' });
  }, [addToast]);

  const handleSelectSpring = (s) => {
    setSelectedSpring(s);
  };

  const handleSubmitVerification = (springId, record) => {
    setSpringsBase(prev => prev.map(s => {
      if (s.id !== springId) return s;
      const oldConf = s.confidenceBase;
      const oldScore = s.rechargeScore || 70;
      const newConf = Math.min(96, oldConf + 7);
      const newScore = Math.min(100, oldScore + (record.discharge > s.baseDischarge ? 2 : -1));

      const updated = {
        ...s,
        verificationStatus: record.verStatus,
        baseDischarge: record.discharge || s.baseDischarge,
        confidenceBase: newConf,
      };

      setFeedbackEvents(f => [{
        springName: s.name, oldConf, newConf, oldScore, newScore,
        timestamp: new Date().toLocaleTimeString()
      }, ...f]);

      addToast({
        title: 'Model updated with new field data',
        message: `${s.name}: Status Verified · Confidence ${oldConf}% → ${newConf}%`,
        type: 'success'
      });

      return updated;
    }));
  };

  const filteredCells = evaluatedData.cells.filter(c => c.confidence >= minConfidence);

  return (
    <div className="app-wrapper">
      {/* EXECUTIVE HEADER */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-icon-box">
            <Droplets size={22} />
          </div>
          <div>
            <div className="brand-title-row">
              <span className="brand-main-title">SpringSense AI</span>
              <span className="badge-proto">Prototype • Synthetic Data</span>
            </div>
            <div className="brand-subtext">
              AI-Based Spring Revival & Recharge Planning
            </div>
          </div>
        </div>

        {/* NAVIGATION SEGMENTS */}
        <div className="nav-segment-container">
          <button className={`nav-tab-btn ${activeTab === TAB_OVERVIEW && !selectedSpring ? 'active' : ''}`} onClick={() => { setActiveTab(TAB_OVERVIEW); setSelectedSpring(null); }}>
            <Compass size={14} /> Dashboard
          </button>
          <button className={`nav-tab-btn ${activeTab === TAB_INTERVENTIONS ? 'active' : ''}`} onClick={() => { setActiveTab(TAB_INTERVENTIONS); setSelectedSpring(null); }}>
            <Layers size={14} /> Interventions & Risks
          </button>
          <button className={`nav-tab-btn ${activeTab === TAB_FIELD ? 'active' : ''}`} onClick={() => { setActiveTab(TAB_FIELD); setSelectedSpring(null); }}>
            <CheckCircle2 size={14} /> Field Validation
          </button>
          <button className={`nav-tab-btn ${activeTab === TAB_FEEDBACK ? 'active' : ''}`} onClick={() => { setActiveTab(TAB_FEEDBACK); setSelectedSpring(null); }}>
            <RefreshCw size={14} /> Feedback Loop
          </button>
        </div>

        {/* LOCATION SELECTOR & ACTIONS */}
        <div className="header-actions">
          {/* LOCATION SWITCHER DROPDOWN */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--slate-50)', border: '1px solid var(--slate-300)', padding: '5px 10px', borderRadius: 8 }}>
            <MapPin size={14} color="var(--primary)" />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate-600)' }}>Study Area:</span>
            <select
              style={{ border: 'none', background: 'none', fontSize: 12, fontWeight: 800, color: 'var(--slate-900)', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              value={selectedRegionKey}
              onChange={e => handleLocationChange(e.target.value)}
            >
              <option value="kolli">⛰️ Kolli Hills (TN)</option>
              <option value="araku">🌄 Araku Valley (AP)</option>
              <option value="nilgiris">🌿 Nilgiris (TN)</option>
            </select>
          </div>

          <button className="btn-how" onClick={() => setShowHow(true)}>
            ? How it Works
          </button>
        </div>
      </header>

      {/* BODY */}
      <div className="app-body">
        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sidebar-content">
            {selectedSpring ? (
              <SpringDetailView
                spring={activeSelectedSpring}
                onBack={() => setSelectedSpring(null)}
              />
            ) : (
              <>
                {activeTab === TAB_OVERVIEW && (
                  <OverviewTab
                    region={activeRegion}
                    springs={evaluatedData.springs}
                    risks={evaluatedData.risks}
                    layers={layers}
                    setLayers={setLayers}
                    minConfidence={minConfidence}
                    setMinConfidence={setMinConfidence}
                    onSelectSpring={handleSelectSpring}
                  />
                )}
                {activeTab === TAB_INTERVENTIONS && (
                  <InterventionsTab
                    interventions={evaluatedData.interventions}
                    risks={evaluatedData.risks}
                  />
                )}
                {activeTab === TAB_FIELD && (
                  <FieldValidationTab
                    springs={evaluatedData.springs}
                    onSubmitVerification={handleSubmitVerification}
                    toastFn={addToast}
                    gpsLoc={fieldGPS}
                    onPickMapGPS={() => {
                      setPickingGPS(true);
                      addToast({ title: 'Use Map Location', message: 'Click anywhere on the map to capture coordinates.' });
                    }}
                  />
                )}
                {activeTab === TAB_FEEDBACK && (
                  <FeedbackTab feedbackEvents={feedbackEvents} />
                )}
              </>
            )}
          </div>
        </div>

        {/* MAP */}
        <div className="map-container" style={{ cursor: pickingGPS ? 'crosshair' : 'default' }}>
          {pickingGPS && (
            <div style={{
              position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.94)', color: 'white', padding: '10px 20px',
              borderRadius: 8, fontSize: 13, fontWeight: 700, zIndex: 999,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: 10
            }}>
              <span>📍 Click anywhere on the map to set GPS location</span>
              <button
                className="btn btn-secondary"
                onClick={() => setPickingGPS(false)}
                style={{ padding: '3px 8px', fontSize: 11 }}
              >
                Cancel
              </button>
            </div>
          )}

          <MapContainer
            center={activeRegion.center}
            zoom={activeRegion.zoom}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <MapController
              center={activeRegion.center}
              zoom={activeRegion.zoom}
              pickingGPS={pickingGPS}
              onPickGPS={handlePickGPS}
            />

            {/* RECHARGE SUITABILITY GRID */}
            {layers.suitability && filteredCells.map(cell => (
              <Rectangle
                key={cell.id}
                bounds={[[cell.latMin, cell.lngMin], [cell.latMax, cell.lngMax]]}
                pathOptions={{
                  color: SUITABILITY_COLORS[cell.suitabilityClass],
                  fillColor: SUITABILITY_COLORS[cell.suitabilityClass],
                  fillOpacity: 0.22,
                  weight: 0.5,
                  opacity: 0.35,
                }}
              >
                <Tooltip sticky>
                  <div style={{ fontSize: 11 }}>
                    <strong>{cell.suitabilityClass} Suitability</strong><br />
                    Score: {cell.rechargeScore} · Slope: {cell.factors.slope.toFixed(0)}°
                  </div>
                </Tooltip>
              </Rectangle>
            ))}

            {/* RISK AREAS */}
            {layers.risks && evaluatedData.risks.map(r => (
              <CircleMarker
                key={r.id}
                center={[r.lat, r.lng]}
                radius={9}
                pathOptions={{ color: '#e11d48', fillColor: '#e11d48', fillOpacity: 0.35, weight: 1.5 }}
                eventHandlers={{
                  click: () => addToast({
                    title: `⚠ ${r.riskType}`,
                    message: `${r.reason} — ${r.recommendation}`,
                    type: 'warning',
                  })
                }}
              >
                <Tooltip>
                  <div style={{ fontSize: 11 }}>
                    <strong>⚠ {r.riskType}</strong><br />
                    {r.reason}
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}

            {/* INTERVENTIONS */}
            {layers.interventions && evaluatedData.interventions.map(site => (
              <CircleMarker
                key={site.id}
                center={[site.lat, site.lng]}
                radius={7}
                pathOptions={{ color: '#7c3aed', fillColor: '#7c3aed', fillOpacity: 0.45, weight: 1.5 }}
                eventHandlers={{
                  click: () => addToast({
                    title: `${site.type} (${site.priority} Priority)`,
                    message: `Score: ${site.suitabilityScore} · ${site.reason}`,
                    type: '',
                  })
                }}
              >
                <Tooltip>
                  <div style={{ fontSize: 11 }}>
                    <strong>{site.type}</strong> ({site.priority} Priority)<br />
                    Target: {site.targetSpring}<br />
                    Suitability Score: {site.suitabilityScore}
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}

            {/* 5 SPRINGS & SPRINGSHED */}
            {layers.springs && evaluatedData.springs.map(s => (
              <React.Fragment key={s.id}>
                {activeSelectedSpring?.id === s.id && (
                  <Polygon
                    positions={s.springshed}
                    pathOptions={{ color: '#1d4ed8', fillColor: '#1d4ed8', fillOpacity: 0.16, weight: 1.5, dashArray: '4,4' }}
                  />
                )}
                <CircleMarker
                  center={[s.lat, s.lng]}
                  radius={activeSelectedSpring?.id === s.id ? 11 : 8}
                  pathOptions={{
                    color: SPRING_STATUS_COLOR[s.status],
                    fillColor: SPRING_STATUS_COLOR[s.status],
                    fillOpacity: activeSelectedSpring?.id === s.id ? 0.95 : 0.7,
                    weight: activeSelectedSpring?.id === s.id ? 2.5 : 1.2,
                  }}
                  eventHandlers={{ click: () => handleSelectSpring(s) }}
                >
                  <Tooltip>
                    <div style={{ fontSize: 11 }}>
                      <strong>{s.name}</strong> ({s.id})<br />
                      Status: {s.status} · Discharge: {s.currentDischarge} L/min<br />
                      Score: {s.rechargeScore} · Confidence: {s.confidence}%
                    </div>
                  </Tooltip>
                </CircleMarker>
              </React.Fragment>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="app-footer">
        <div>SpringSense AI • SIH 2026 Prototype • Synthetic Data for Demonstration</div>
        <div>Target Study Area: <strong>{activeRegion.name}, {activeRegion.district}</strong></div>
      </footer>

      {showHow && <HowItWorksModal onClose={() => setShowHow(false)} />}
      <ToastContainer toasts={toasts} />
    </div>
  );
}

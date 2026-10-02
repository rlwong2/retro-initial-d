import { useRef, useState } from 'react';
import { OrbitControls } from '@react-three/drei';
import PixelCanvas, { Stage, CAR_CENTER } from '../three/PixelCanvas.jsx';
import CarModel from '../three/CarModel.jsx';
import PixelButton from '../components/PixelButton.jsx';
import PixelPanel from '../components/PixelPanel.jsx';
import { COLORS, WHEELS, SPOILERS, byId } from '../data/options.js';
import { exportCarImage } from '../utils/exportImage.js';

const TABS = [
  { id: 'color', label: 'COLOR', icon: '■', list: COLORS },
  { id: 'wheel', label: 'WHEELS', icon: '◎', list: WHEELS },
  { id: 'spoiler', label: 'SPOILER', icon: '▲', list: SPOILERS },
];

function Swatch({ tab, opt }) {
  if (tab === 'color') return <i className="swatch" style={{ background: opt.hex }} />;
  if (tab === 'wheel') return <i className="swatch swatch--wheel" style={{ '--rim': opt.rim }} />;
  return <i className={`swatch swatch--spoiler swatch--${opt.id}`} />;
}

export default function Customize({ car, config, onChange, onReset, onBack }) {
  const [tab, setTab] = useState('color');
  const [busy, setBusy] = useState(false);
  const three = useRef(null);
  const active = TABS.find((t) => t.id === tab);

  const summary = [byId(COLORS, config.color).name, `${byId(WHEELS, config.wheel).name} wheels`, `${byId(SPOILERS, config.spoiler).name} spoiler`];

  const doExport = async () => {
    if (!three.current) return;
    setBusy(true);
    try {
      await exportCarImage(three.current, {
        carName: car.name,
        lines: summary,
        fileName: `retro-initial-d-${car.id}.png`,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="custom">
      <header className="custom__top">
        <PixelButton onClick={onBack}>◀ BACK</PixelButton>
        <h1 className="custom__title">{car.name}</h1>
        <span className="custom__hint">DRAG TO ROTATE</span>
      </header>

      <nav className="tabs" aria-label="Customization category">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab ${tab === t.id ? 'is-active' : ''}`}
            aria-pressed={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            <span className="tab__icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      <div className="stage">
        <PixelCanvas pixel={5} camera={{ position: [7.4, 3, 7.4], fov: 30 }} onCreated={(s) => (three.current = s)}>
          <Stage />
          <CarModel car={car} config={config} />
          <OrbitControls
            target={CAR_CENTER}
            enablePan={false}
            minDistance={6.5}
            maxDistance={15}
            minPolarAngle={0.5}
            maxPolarAngle={Math.PI / 2.05}
            autoRotate
            autoRotateSpeed={1.2}
          />
        </PixelCanvas>
        <div className="stage__summary">{summary.join(' · ')}</div>
      </div>

      <PixelPanel title={active.label} className="options">
        <ul role="listbox" aria-label={active.label}>
          {active.list.map((opt) => {
            const selected = config[tab] === opt.id;
            return (
              <li key={opt.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`option ${selected ? 'is-selected' : ''}`}
                  onClick={() => onChange({ [tab]: opt.id })}
                >
                  <span className="option__cursor">{selected ? '▶' : ''}</span>
                  <Swatch tab={tab} opt={opt} />
                  <span className="option__name">{opt.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </PixelPanel>

      <footer className="custom__bottom">
        <PixelButton variant="ghost" onClick={onReset}>RESET</PixelButton>
        <PixelButton variant="primary" onClick={doExport} disabled={busy}>
          {busy ? 'SAVING…' : '★ EXPORT PNG'}
        </PixelButton>
      </footer>
    </main>
  );
}

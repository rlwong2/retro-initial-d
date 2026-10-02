import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import PixelCanvas, { Stage } from '../three/PixelCanvas.jsx';
import CarModel from '../three/CarModel.jsx';

function Turntable({ children, speed = 0.6 }) {
  const ref = useRef();
  useFrame((_, dt) => {
    ref.current.rotation.y += dt * speed;
  });
  return <group ref={ref}>{children}</group>;
}

function StatBar({ label, value }) {
  return (
    <div className="stat">
      <span className="stat__label">{label}</span>
      <span className="stat__bar" aria-label={`${label} ${value} of 10`}>
        {Array.from({ length: 10 }, (_, i) => (
          <i key={i} className={i < value ? 'on' : ''} />
        ))}
      </span>
    </div>
  );
}

export default function Garage({ cars, configs, onSelect }) {
  const gridRef = useRef();

  const onKeyDown = (e) => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (!(e.key in keys)) return;
    const buttons = [...gridRef.current.querySelectorAll('.car-card')];
    const i = buttons.indexOf(document.activeElement);
    const next = buttons[(Math.max(i, 0) + keys[e.key] + buttons.length) % buttons.length];
    next.focus();
    e.preventDefault();
  };

  return (
    <main className="garage">
      <header className="garage__header">
        <h1 className="logo">
          <span className="logo__a">RETRO</span> <span className="logo__b">INITIAL D</span>
        </h1>
        <p className="blink">▶ SELECT YOUR RIDE ◀</p>
      </header>

      <div className="car-grid" ref={gridRef} onKeyDown={onKeyDown}>
        {cars.map((car, i) => (
          <button key={car.id} type="button" className="car-card" onClick={() => onSelect(car.id)} autoFocus={i === 0}>
            <PixelCanvas pixel={2} camera={{ position: [5.4, 2.4, 5.4], fov: 34 }}>
              <Stage />
              <Turntable>
                <CarModel car={car} config={configs[car.id]} />
              </Turntable>
            </PixelCanvas>
            <div className="car-card__info">
              <span className="car-card__num">P{i + 1}</span>
              <h3>{car.name}</h3>
              <p className="car-card__tag">{car.tagline}</p>
              <StatBar label="SPD" value={car.stats.speed} />
              <StatBar label="HND" value={car.stats.handling} />
              <StatBar label="DRF" value={car.stats.drift} />
            </div>
          </button>
        ))}
      </div>

      <footer className="garage__footer">
        <span>← → MOVE</span>
        <span>ENTER SELECT</span>
        <span className="credit">© 198X PIXEL MOTORS</span>
      </footer>
    </main>
  );
}

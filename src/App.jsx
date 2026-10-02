import { useState } from 'react';
import { CARS } from './data/cars.js';
import Garage from './screens/Garage.jsx';
import Customize from './screens/Customize.jsx';

const initialConfigs = () => Object.fromEntries(CARS.map((c) => [c.id, { ...c.defaults }]));

export default function App() {
  const [carId, setCarId] = useState(null);
  // Kept per car so leaving the garage and coming back preserves the build.
  const [configs, setConfigs] = useState(initialConfigs);

  const car = CARS.find((c) => c.id === carId);

  if (!car) {
    return <Garage cars={CARS} configs={configs} onSelect={setCarId} />;
  }
  return (
    <Customize
      car={car}
      config={configs[car.id]}
      onChange={(patch) => setConfigs((all) => ({ ...all, [car.id]: { ...all[car.id], ...patch } }))}
      onReset={() => setConfigs((all) => ({ ...all, [car.id]: { ...car.defaults } }))}
      onBack={() => setCarId(null)}
    />
  );
}

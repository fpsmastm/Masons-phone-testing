import { useMemo } from 'react';
import { useApp } from '../store';

export function RainEffect() {
  const { state } = useApp();
  const { rainEnabled, rainIntensity } = state.settings;

  const drops = useMemo(() => {
    if (!rainEnabled) return [];
    const count = Math.floor(rainIntensity * 1.5);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      height: Math.random() * 20 + 10,
      delay: Math.random() * 5,
      duration: Math.random() * 1 + 0.8,
      opacity: Math.random() * 0.4 + 0.1,
    }));
  }, [rainEnabled, rainIntensity]);

  if (!rainEnabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {drops.map(drop => (
        <div
          key={drop.id}
          className="rain-drop"
          style={{
            left: `${drop.left}%`,
            height: `${drop.height}px`,
            animationDelay: `${drop.delay}s`,
            animationDuration: `${drop.duration}s`,
            opacity: drop.opacity,
          }}
        />
      ))}
    </div>
  );
}

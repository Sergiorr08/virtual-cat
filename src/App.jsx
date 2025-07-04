import React, { useState, useEffect, useRef } from 'react';
import { Stage } from '@inlet/react-pixi';
import Cat from './components/Cat';
import './app.css';

const initialState = () => {
  const saved = localStorage.getItem('catState');
  return saved
    ? JSON.parse(saved)
    : { name: 'Michi', hunger: 50, happiness: 50, action: 'idle', x: 500, y: 100 };
};

export default function App() {
  const [state, setState] = useState(initialState);
  const [position, setPosition] = useState({ x: state.x, y: state.y });
  const [flip, setFlip] = useState(false);
  const [stageSize, setStageSize] = useState({ width: 800, height: 400 });

  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setStageSize({ width, height });
      }
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    localStorage.setItem('catState', JSON.stringify(state));
  }, [state]);

  const moveRandomly = () => {
    cancelAnimationFrame(animationRef.current);
    const speed = 1;
    const spriteWidth = 80;
    const spriteHeight = 80;

    let dx = (Math.random() < 0.5 ? -1 : 1) * speed;
    let dy = (Math.random() < 0.5 ? -1 : 1) * speed;

    setState(prev => ({ ...prev, action: 'walk' }));

    const animate = () => {
      if (!isMounted.current) return;

      setPosition(prev => {
        let newX = prev.x + dx;
        let newY = prev.y + dy;

        // Rebote horizontal
        if (newX <= 0 || newX >= stageSize.width - spriteWidth) {
          dx *= -1;
          newX = Math.max(0, Math.min(stageSize.width - spriteWidth, newX));
          setFlip(dx < 0);
        }

        // Rebote vertical
        if (newY <= 0 || newY >= stageSize.height - spriteHeight) {
          dy *= -1;
          newY = Math.max(0, Math.min(stageSize.height - spriteHeight, newY));
        }

        return { x: newX, y: newY };
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    isMounted.current = true;
    moveRandomly();

    return () => {
      isMounted.current = false;
      cancelAnimationFrame(animationRef.current);
    };
  }, [stageSize]);

  useEffect(() => {
    const hungerInterval = setInterval(() => {
      setState(prev => ({
        ...prev,
        hunger: Math.min(100, prev.hunger + 2),
        happiness: Math.max(0, prev.happiness - 1)
      }));
    }, 30000);
    return () => clearInterval(hungerInterval);
  }, []);

  const updateAction = (type) => {
    let { hunger, happiness } = state;
    if (type === 'feed') hunger = Math.max(0, hunger - 10);
    if (type === 'pet') happiness = Math.min(100, happiness + 10);
    if (type === 'play') {
      happiness = Math.min(100, happiness + 15);
      hunger = Math.min(100, hunger + 5);
    }

    const map = { feed: 'sitting', pet: 'meow', play: 'run' };

    cancelAnimationFrame(animationRef.current);
    setState(prev => ({ ...prev, hunger, happiness, action: map[type] }));

    setTimeout(() => {
      if (isMounted.current) {
        setState(prev => ({ ...prev, action: 'idle' }));
        moveRandomly();
      }
    }, 4000);
  };

  const handleName = e => setState(p => ({ ...p, name: e.target.value }));

  return (
    <div className="virtual-pet-app">
      <header className="app-header">
        <h1>🐾 Mascota Virtual</h1>
        <div className="pet-name-container">
          <input 
            className="pet-name-input" 
            value={state.name} 
            onChange={handleName} 
            placeholder="Nombre de tu mascota" 
          />
        </div>
      </header>

      <div className="pet-info-panel">
        <div className="status-bars">
          <div className="status-bar">
            <div className="status-label">
              <span className="status-icon">🍗</span>
              <span>Hambre</span>
            </div>
            <div className="status-bar-container">
              <div 
                className="status-bar-fill hunger" 
                style={{ 
                  width: `${state.hunger}%`,
                  backgroundColor: state.hunger > 80 ? '#ff6b6b' : state.hunger > 50 ? '#ffd166' : '#06d6a0'
                }}
              ></div>
            </div>
            <span className="status-value">{state.hunger}%</span>
          </div>

          <div className="status-bar">
            <div className="status-label">
              <span className="status-icon">😊</span>
              <span>Felicidad</span>
            </div>
            <div className="status-bar-container">
              <div 
                className="status-bar-fill happiness" 
                style={{ 
                  width: `${state.happiness}%`,
                  backgroundColor: state.happiness > 80 ? '#06d6a0' : state.happiness > 50 ? '#ffd166' : '#ff6b6b'
                }}
              ></div>
            </div>
            <span className="status-value">{state.happiness}%</span>
          </div>
        </div>

        <div className="action-buttons">
          <button className="action-button pet" onClick={() => updateAction('pet')}>
            <span className="button-icon">✋</span><span>Acariciar</span>
          </button>
          <button className="action-button feed" onClick={() => updateAction('feed')}>
            <span className="button-icon">🍪</span><span>Alimentar</span>
          </button>
          <button className="action-button play" onClick={() => updateAction('play')}>
            <span className="button-icon">🧶</span><span>Jugar</span>
          </button>
        </div>
      </div>

      <div className="game-container" ref={containerRef}>
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          options={{ backgroundColor: 0xf0f8ff, antialias: true }}
        >
          <Cat x={position.x} y={position.y} action={state.action} flip={flip} />
        </Stage>
      </div>

      <footer className="app-footer">
        <p>Mascota Virtual - Desarrollado con React y PixiJS</p>
      </footer>
    </div>
  );
}

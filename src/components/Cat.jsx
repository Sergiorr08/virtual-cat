import React, { useEffect, useState } from 'react';
import { AnimatedSprite } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js';

const animations = {
  idle: { file: 'Cat-3-Idle.png', frames: 10 },
  sitting: { file: 'Cat-3-Sitting.png', frames: 1 },
  walk: { file: 'Cat-3-Walk.png', frames: 8 },
  run: { file: 'Cat-3-Run.png', frames: 8 },
  meow: { file: 'Cat-3-Meow.png', frames: 5 },
  licking1: { file: 'Cat-3-Licking-1.png', frames: 5 },
  stretching: { file: 'Cat-3-Stretching.png', frames: 5 }
};

export default function Cat({ x = 0, y = 0, action = 'idle', flip = false }) {
  const [textures, setTextures] = useState([]);

  useEffect(() => {
    const { file, frames } = animations[action];
    const baseTexture = PIXI.BaseTexture.from(`/sprites/${file}`);

    const loadFrames = () => {
      const frameWidth = baseTexture.width / frames;
      const frameHeight = baseTexture.height;

      const framesArray = Array.from({ length: frames }, (_, i) =>
        new PIXI.Texture(baseTexture, new PIXI.Rectangle(i * frameWidth, 0, frameWidth, frameHeight))
      );

      setTextures(framesArray);
    };

    if (baseTexture.valid) {
      loadFrames();
    } else {
      baseTexture.once('loaded', loadFrames);
    }

    return () => {
      setTextures([]); // limpiar en cambio de acción
    };
  }, [action]);

  if (!textures.length) return null;

  return (
    <AnimatedSprite
      textures={textures}
      isPlaying={true}
      animationSpeed={0.2}
      x={x}
      y={y}
      anchor={0.5}
      scale={{ x: flip ? -1 : 1, y: 1 }}
    />
  );
}

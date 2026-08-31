import { useEffect, useState } from 'react';

export type FitOrientation = 'landscape' | 'portrait';

const STAGE_SIZE: Record<FitOrientation, { width: number; height: number }> = {
  landscape: { width: 1920, height: 1080 },
  portrait: { width: 1080, height: 1920 },
};

export interface FitScale {
  /** Множитель масштаба сцены (min по обеим осям). */
  scale: number;
  /** Ширина сцены в дизайн-пикселях (1920 или 1080). */
  width: number;
  /** Высота сцены в дизайн-пикселях (1080 или 1920). */
  height: number;
  /** Смещение сцены от левого края viewport для центрирования по свободной оси. */
  offsetX: number;
  /** Смещение сцены от верхнего края viewport для центрирования по свободной оси. */
  offsetY: number;
}

function computeFitScale(orientation: FitOrientation): FitScale {
  const { width, height } = STAGE_SIZE[orientation];

  if (typeof window === 'undefined') {
    return { scale: 1, width, height, offsetX: 0, offsetY: 0 };
  }

  const scale = Math.min(window.innerWidth / width, window.innerHeight / height);
  const offsetX = (window.innerWidth - width * scale) / 2;
  const offsetY = (window.innerHeight - height * scale) / 2;

  return { scale, width, height, offsetX, offsetY };
}

/**
 * Масштаб фиксированного экрана (1920×1080 / 1080×1920) под реальный viewport.
 * k = min(innerWidth / W, innerHeight / H), сцена центрируется по свободной оси.
 * При точном совпадении viewport с дизайн-размером даёт scale = 1, offset = 0.
 */
export function useFitScale(orientation: FitOrientation): FitScale {
  const [fit, setFit] = useState<FitScale>(() => computeFitScale(orientation));

  useEffect(() => {
    function update() {
      setFit(computeFitScale(orientation));
    }

    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, [orientation]);

  return fit;
}

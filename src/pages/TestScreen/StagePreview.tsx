import type { ReactNode } from 'react';
import { EmbeddedStageContext } from '../../components/ui/Background';
import { STAGE_SIZE, type FitOrientation } from '../../components/ui/useFitScale';

interface StagePreviewProps {
  orientation: FitOrientation;
  /** Ширина превью в px; масштаб = width / ширина сцены. */
  width: number;
  children: ReactNode;
}

/**
 * Рамка для полноэкранных компонентов на странице /ui-kit.
 * Любой Background внутри (в том числе внутри игр) рендерится встроенно и в нужном масштабе.
 */
export function StagePreview({ orientation, width, children }: StagePreviewProps) {
  const stage = STAGE_SIZE[orientation];
  const scale = width / stage.width;

  return (
    <EmbeddedStageContext.Provider value={{ scale }}>
      <div style={{ width, height: stage.height * scale, flex: 'none', overflow: 'hidden' }}>{children}</div>
    </EmbeddedStageContext.Provider>
  );
}

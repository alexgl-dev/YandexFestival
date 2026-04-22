import { useEffect, useState } from 'react';
import { InfoButton, PopUp } from '../../components/ui';
import { parseInstructionWithBoldMarkup } from './instructionMarkup';
import styles from './GameInstruction.module.css';

interface GameInstructionProps {
  instruction?: string;
  /** Если задано, начальное состояние оверлея; иначе при непустой инструкции открыт сразу (как в проверке безопасности). */
  initialOpen?: boolean;
  /** Вызывается при закрытии инструкции («Начать» или клик по фону). */
  onClose?: () => void;
  /** Вызывается при любом изменении состояния оверлея — нужен играм, которые должны паузить логику. */
  onOpenChange?: (open: boolean) => void;
}

export function GameInstruction({ instruction, initialOpen, onClose, onOpenChange }: GameInstructionProps) {
  const hasInstruction = !!instruction?.trim();
  const [open, setOpen] = useState(
    initialOpen !== undefined ? initialOpen : hasInstruction,
  );
  const [activeTerm, setActiveTerm] = useState<{ term: string; definition: string } | null>(null);

  useEffect(() => {
    if (hasInstruction) onOpenChange?.(open);
  }, [open, hasInstruction, onOpenChange]);

  if (!hasInstruction) return null;

  const close = () => {
    onClose?.();
    setOpen(false);
    setActiveTerm(null);
  };

  return (
    <>
      <InfoButton
        size="sm"
        variant="dark"
        className={styles.infoButton}
        onClick={() => setOpen(true)}
      />
      {open && (
        <div
          className={styles.overlay}
          role="presentation"
          onClick={close}
        >
          <div role="presentation" onClick={(e) => e.stopPropagation()}>
            <PopUp
              title="Инструкция"
              description={parseInstructionWithBoldMarkup(
                instruction ?? '',
                (term, definition) => setActiveTerm({ term, definition }),
                'gi',
                styles.termBtn,
                styles.instructionLead,
                styles.instructionItalic,
              )}
              buttonLabel="Начать"
              onButtonClick={close}
            />
          </div>
          {activeTerm && (
            <div className={styles.termOverlay} onClick={() => setActiveTerm(null)}>
              <div onClick={(e) => e.stopPropagation()}>
                <PopUp
                  title={activeTerm.term.charAt(0).toUpperCase() + activeTerm.term.slice(1)}
                  description={activeTerm.definition}
                  buttonLabel="Понятно"
                  onButtonClick={() => setActiveTerm(null)}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

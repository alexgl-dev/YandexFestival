import { useState } from 'react';
import { InfoButton, PopUp } from '../../components/ui';
import { parseInstructionWithBoldMarkup } from './instructionMarkup';
import styles from './GameInstruction.module.css';

interface GameInstructionProps {
  instruction?: string;
  /** Если задано, начальное состояние оверлея; иначе при непустой инструкции открыт сразу (как в проверке безопасности). */
  initialOpen?: boolean;
  /** Вызывается при закрытии инструкции («Начать» или клик по фону). */
  onClose?: () => void;
}

export function GameInstruction({ instruction, initialOpen, onClose }: GameInstructionProps) {
  const hasInstruction = !!instruction?.trim();
  const [open, setOpen] = useState(
    initialOpen !== undefined ? initialOpen : hasInstruction,
  );
  const [tooltip, setTooltip] = useState<string | null>(null);

  if (!hasInstruction) return null;

  const close = () => {
    onClose?.();
    setOpen(false);
    setTooltip(null);
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
              description={
                <>
                  {parseInstructionWithBoldMarkup(
                    instruction ?? '',
                    (tip) => setTooltip((prev) => (prev === tip ? null : tip)),
                    'gi',
                    styles.termBtn,
                    styles.instructionLead,
                    styles.instructionItalic,
                  )}
                  {tooltip && (
                    <div
                      className={styles.tooltipCard}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTooltip(null);
                      }}
                    >
                      <p className={styles.tooltipText}>{tooltip}</p>
                      <span className={styles.tooltipDismiss}>✕</span>
                    </div>
                  )}
                </>
              }
              buttonLabel="Начать"
              onButtonClick={close}
            />
          </div>
        </div>
      )}
    </>
  );
}

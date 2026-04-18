import { useState, type ReactNode } from 'react';
import { InfoButton, PopUp } from '../../components/ui';
import styles from './GameInstruction.module.css';

interface GameInstructionProps {
  instruction?: string;
}

/** Parse `[term]{tooltip: "..."}` markup into interactive term buttons. */
function parseInstruction(
  text: string,
  onTooltip: (text: string | null) => void,
): ReactNode[] {
  const regex = /\[([^\]]+)\]\{tooltip:\s*"([^"]*)"\}/g;
  const parts: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) {
      parts.push(<span key={key++}>{text.slice(last, m.index)}</span>);
    }
    const term = m[1];
    const tip = m[2];
    parts.push(
      <button
        key={key++}
        type="button"
        className={styles.termBtn}
        onClick={(e) => {
          e.stopPropagation();
          onTooltip(tip);
        }}
      >
        {term}
      </button>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    parts.push(<span key={key++}>{text.slice(last)}</span>);
  }
  return parts.length ? parts : [<span key={0}>{text}</span>];
}

export function GameInstruction({ instruction }: GameInstructionProps) {
  const hasInstruction = !!instruction?.trim();
  const [open, setOpen] = useState(hasInstruction);
  const [tooltip, setTooltip] = useState<string | null>(null);

  if (!hasInstruction) return null;

  const close = () => {
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
        <div className={styles.overlay}>
          <PopUp
            title="Инструкция"
            description={
              <>
                {parseInstruction(instruction ?? '', (t) =>
                  setTooltip((prev) => (prev === t ? null : t)),
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
      )}
    </>
  );
}

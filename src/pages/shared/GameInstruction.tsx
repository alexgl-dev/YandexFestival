import { useState, type ReactNode } from 'react';
import { InfoButton, PopUp } from '../../components/ui';
import styles from './GameInstruction.module.css';

interface GameInstructionProps {
  instruction?: string;
  /** Если задано, начальное состояние оверлея; иначе при непустой инструкции открыт сразу (как в проверке безопасности). */
  initialOpen?: boolean;
}

/** Parse `[term]{tooltip: "..."}` markup into interactive term buttons. */
function parseInstruction(
  text: string,
  onTooltip: (text: string | null) => void,
  keyPrefix: string,
): ReactNode[] {
  const regex = /\[([^\]]+)\]\{tooltip:\s*"([^"]*)"\}/g;
  const parts: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) {
      parts.push(
        <span key={`${keyPrefix}-t-${key++}`}>{text.slice(last, m.index)}</span>,
      );
    }
    const term = m[1];
    const tip = m[2];
    parts.push(
      <button
        key={`${keyPrefix}-t-${key++}`}
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
    parts.push(<span key={`${keyPrefix}-t-${key++}`}>{text.slice(last)}</span>);
  }
  return parts.length ? parts : [<span key={`${keyPrefix}-t-0`}>{text}</span>];
}

/** Разбирает `<b>…</b>` и вложенные тултипы; только доверенный разметочный поднабор из данных. */
function parseInstructionWithBold(
  text: string,
  onTooltip: (text: string | null) => void,
): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let boldIdx = 0;
  const boldRe = /<b>([\s\S]*?)<\/b>/g;
  let m: RegExpExecArray | null;

  while ((m = boldRe.exec(text)) !== null) {
    if (m.index > last) {
      out.push(
        ...parseInstruction(text.slice(last, m.index), onTooltip, `p${boldIdx}`),
      );
    }
    boldIdx += 1;
    out.push(
      <strong key={`bold-${boldIdx}`} className={styles.instructionLead}>
        {parseInstruction(m[1], onTooltip, `b${boldIdx}`)}
      </strong>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    out.push(...parseInstruction(text.slice(last), onTooltip, `p${boldIdx}`));
  }
  return out.length ? out : parseInstruction(text, onTooltip, '0');
}

export function GameInstruction({ instruction, initialOpen }: GameInstructionProps) {
  const hasInstruction = !!instruction?.trim();
  const [open, setOpen] = useState(
    initialOpen !== undefined ? initialOpen : hasInstruction,
  );
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
                  {parseInstructionWithBold(instruction ?? '', (t) =>
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
        </div>
      )}
    </>
  );
}

import { useEffect, useState } from 'react';
import { parseInstructionMarkup, parseInstructionWithBoldMarkup } from './instructionMarkup';
import styles from './GameInstruction.module.css';

interface InstructionRichTextProps {
  text: string;
  /** Разрешить `<b>…</b>` как в инструкции к играм */
  withBold?: boolean;
}

/**
 * Текст с разметкой `[термин]{tooltip: "…"}` (и опционально `<b>`) для блоков вроде PopUp.description.
 */
export function InstructionRichText({ text, withBold }: InstructionRichTextProps) {
  const [tooltip, setTooltip] = useState<string | null>(null);

  useEffect(() => {
    setTooltip(null);
  }, [text]);

  const onTerm = (tip: string) => {
    setTooltip((prev) => (prev === tip ? null : tip));
  };

  const body = withBold
    ? parseInstructionWithBoldMarkup(text, onTerm, 'rich', styles.termBtn, styles.instructionLead)
    : parseInstructionMarkup(text, onTerm, 'rich', styles.termBtn);

  return (
    <>
      {body}
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
  );
}

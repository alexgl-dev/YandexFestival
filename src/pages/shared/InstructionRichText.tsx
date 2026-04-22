import { useEffect, useState } from 'react';
import { PopUp } from '../../components/ui';
import { parseInstructionMarkup, parseInstructionWithBoldMarkup } from './instructionMarkup';
import styles from './GameInstruction.module.css';

interface InstructionRichTextProps {
  text: string;
  /** Разрешить `<b>…</b>` как в инструкции к играм */
  withBold?: boolean;
}

type ActiveTerm = { term: string; definition: string };

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Текст с разметкой `[термин]{tooltip: "…"}` (и опционально `<b>`) для блоков вроде PopUp.description.
 * По клику на термин показывает унифицированный модальный PopUp с определением.
 */
export function InstructionRichText({ text, withBold }: InstructionRichTextProps) {
  const [active, setActive] = useState<ActiveTerm | null>(null);

  useEffect(() => {
    setActive(null);
  }, [text]);

  const onTerm = (term: string, definition: string) => {
    setActive({ term, definition });
  };

  const body = withBold
    ? parseInstructionWithBoldMarkup(text, onTerm, 'rich', styles.termBtn, styles.instructionLead)
    : parseInstructionMarkup(text, onTerm, 'rich', styles.termBtn);

  return (
    <>
      {body}
      {active && (
        <div className={styles.termOverlay} onClick={() => setActive(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <PopUp
              title={capitalize(active.term)}
              description={active.definition}
              buttonLabel="Понятно"
              onButtonClick={() => setActive(null)}
              compact
            />
          </div>
        </div>
      )}
    </>
  );
}

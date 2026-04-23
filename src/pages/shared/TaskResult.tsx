import { useState } from 'react';
import { Background, Button, PopUp } from '../../components/ui';
import { parseInstructionMarkup } from './instructionMarkup';
import styles from './TaskResult.module.css';

interface ResultItem {
  answer: string;
  correct: boolean;
  explanation: string;
  group?: string;
}

interface TaskResultProps {
  results: ResultItem[];
  onContinue: () => void;
  theme?: 'cobalt' | 'orange';
  orientation?: 'landscape' | 'portrait';
}

export function TaskResult({ results, onContinue, theme = 'orange', orientation = 'portrait' }: TaskResultProps) {
  const [activeTerm, setActiveTerm] = useState<{ term: string; definition: string } | null>(null);

  const hasGroups = results.length > 0 && results.every((r) => !!r.group);
  const groups: { name: string; items: { result: ResultItem; index: number }[] }[] = [];
  if (hasGroups) {
    const order = new Map<string, number>();
    results.forEach((r, i) => {
      const name = r.group!;
      if (!order.has(name)) {
        order.set(name, groups.length);
        groups.push({ name, items: [] });
      }
      groups[order.get(name)!].items.push({ result: r, index: i });
    });
  }

  const renderItem = (result: ResultItem, index: number) => (
    <div
      key={index}
      className={[
        styles.item,
        result.correct ? styles.itemCorrect : styles.itemWrong,
      ].join(' ')}
    >
      <span className={styles.itemText}>
        <span className={styles.itemAnswer}>{result.answer}</span>
        {result.explanation ? (
          <span className={styles.itemExplanation}>
            {' — '}
            {parseInstructionMarkup(
              result.explanation,
              (term, definition) => setActiveTerm({ term, definition }),
              `tr-${index}`,
              styles.termBtn,
            )}
          </span>
        ) : null}
      </span>
    </div>
  );

  return (
    <Background theme={theme} orientation={orientation} showBackButton={false}>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h2 className={styles.cardTitle}>Результаты</h2>
          </div>
          <div className={styles.items}>
            {hasGroups
              ? groups.map((g) => (
                  <div key={g.name} className={styles.group}>
                    <h3 className={styles.groupTitle}>{g.name}</h3>
                    {g.items.map(({ result, index }) => renderItem(result, index))}
                  </div>
                ))
              : results.map((r, i) => renderItem(r, i))}
          </div>
          <div className={styles.buttonWrap}>
            <Button label="Далее" type="main" onClick={onContinue} />
          </div>
        </div>
      </div>

      {activeTerm && (
        <div className={styles.termOverlay} onClick={() => setActiveTerm(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <PopUp
              title={activeTerm.term.charAt(0).toUpperCase() + activeTerm.term.slice(1)}
              description={activeTerm.definition}
              buttonLabel="Понятно"
              onButtonClick={() => setActiveTerm(null)}
              compact
            />
          </div>
        </div>
      )}
    </Background>
  );
}

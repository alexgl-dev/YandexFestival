import { useCallback, useMemo, useState } from 'react';
import { Background, Button, IconButton } from '../../../components/ui';
import type { Task } from '../../../types/game';
import { GameInstruction } from '../GameInstruction';
import styles from './BuilderGame.module.css';

interface GameResult {
  answer: string;
  correct: boolean;
  explanation: string;
}

interface GameProps {
  task: Task;
  onComplete: (results: GameResult[]) => void;
  onBack: () => void;
  theme?: 'cobalt' | 'orange';
  orientation?: 'landscape' | 'portrait';
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Механика `builder` — «Собери робота».
 * Данные: task.steps[0].builderFields[] — параметры с вариантами; resultImages[] — готовые картинки-результаты.
 * Список параметров скроллится, выбор варианта — попап-список поверх экрана (не <select>).
 * Картинка результата выбирается детерминированно по хэшу выбранных опций.
 */
export function BuilderGame({ task, onComplete, onBack, theme = 'orange', orientation = 'portrait' }: GameProps) {
  const step = task.steps[0];
  const fields = useMemo(() => step?.builderFields ?? [], [step]);
  const resultImages = step?.resultImages ?? [];

  const [selections, setSelections] = useState<Record<string, string>>({});
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [resultImage, setResultImage] = useState<string | null>(null);

  const activeField = fields.find((f) => f.id === activeFieldId) ?? null;
  const isDone = resultImage !== null;

  const handleSelect = useCallback((fieldId: string, option: string) => {
    setSelections((prev) => ({ ...prev, [fieldId]: option }));
    setInvalidFields((prev) => {
      if (!prev.has(fieldId)) return prev;
      const next = new Set(prev);
      next.delete(fieldId);
      return next;
    });
    setActiveFieldId(null);
  }, []);

  const handleReset = useCallback(() => {
    setSelections({});
    setInvalidFields(new Set());
    setActiveFieldId(null);
    setResultImage(null);
  }, []);

  const handleGenerate = useCallback(() => {
    const missing = fields.filter((f) => !selections[f.id]);
    if (missing.length > 0) {
      setInvalidFields(new Set(missing.map((f) => f.id)));
      const el = document.querySelector(`[data-field="${missing[0].id}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setInvalidFields(new Set());
    if (resultImages.length === 0) return;
    const key = fields.map((f) => `${f.id}:${selections[f.id]}`).join('|');
    const idx = hashString(key) % resultImages.length;
    setResultImage(resultImages[idx]);
  }, [fields, selections, resultImages]);

  const handleDone = useCallback(() => {
    const answer = fields.map((f) => selections[f.id]).filter(Boolean).join(', ');
    onComplete([{ answer, correct: true, explanation: 'Робот собран по твоему описанию.' }]);
  }, [fields, selections, onComplete]);

  const overlayClass = orientation === 'landscape' ? styles.overlayLandscape : styles.overlayPortrait;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <GameInstruction instruction={task.instruction} initialOpen={false} />

      {!isDone ? (
        <div className={styles.wrapper}>
          <div className={`${styles.fieldsList} ui-scrollbar`}>
            {fields.map((field) => {
              const value = selections[field.id];
              const invalid = invalidFields.has(field.id);
              return (
                <div
                  key={field.id}
                  data-field={field.id}
                  className={`${styles.fieldRow} ${invalid ? styles.fieldRowInvalid : ''}`}
                >
                  <span className={styles.fieldLabel}>{field.label}</span>
                  <Button
                    label={value ?? 'Выбрать'}
                    type={value ? 'main' : 'outline'}
                    onClick={() => setActiveFieldId(field.id)}
                    className={styles.fieldSelectBtn}
                  />
                </div>
              );
            })}
          </div>

          <div className={styles.actions}>
            <Button label="Сбросить" type="secondary" onClick={handleReset} />
            <Button label="Генерация" type="secondary" onClick={handleGenerate} />
          </div>
        </div>
      ) : (
        <div className={styles.resultWrapper}>
          <div className={styles.resultImageFrame}>
            <img src={resultImage ?? ''} alt="Твой робот" className={styles.resultImage} />
          </div>
          <Button label="Готово" type="secondary" onClick={handleDone} />
        </div>
      )}

      {activeField && (
        <div className={`${styles.overlay} ${overlayClass}`} onClick={() => setActiveFieldId(null)}>
          <div className={styles.picker} onClick={(e) => e.stopPropagation()}>
            <IconButton type="close" onClick={() => setActiveFieldId(null)} className={styles.pickerClose} />
            <h2 className={styles.pickerTitle}>{activeField.label}</h2>
            <div className={`${styles.pickerOptions} ui-scrollbar`}>
              {activeField.options.map((option) => {
                const isChosen = selections[activeField.id] === option;
                return (
                  <Button
                    key={option}
                    label={option}
                    type="outline"
                    pressed={isChosen}
                    onClick={() => handleSelect(activeField.id, option)}
                    className={styles.pickerBtn}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Background>
  );
}

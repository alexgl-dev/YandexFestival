import { useMemo, useState } from 'react';
import { Button } from '../../components/ui';
import type { SectionData, Task } from '../../types/game';
import { creativeSection } from '../creative/data';
import { developmentSection } from '../development/data';
import { managementSection } from '../management/data';
import { dataSection } from '../data/data';
import { accessSection } from '../informatics/access/data';
import { advertisingSection } from '../informatics/advertising/data';
import { mlSection } from '../informatics/ml/data';
import { aiSection } from '../informatics/ai/data';
import { TaskIntro } from '../shared/TaskIntro';
import { TaskMoral } from '../shared/TaskMoral';
import { TaskResult } from '../shared/TaskResult';
import { GameRouter } from '../shared/GameRouter';
import { StagePreview } from './StagePreview';
import styles from './TestScreen.module.css';

const SECTIONS: SectionData[] = [
  creativeSection,
  developmentSection,
  managementSection,
  dataSection,
  accessSection,
  advertisingSection,
  mlSection,
  aiSection,
];

const PHASES = [
  { id: 'intro', label: 'TaskIntro' },
  { id: 'game', label: 'Игра' },
  { id: 'moral', label: 'TaskMoral' },
  { id: 'result', label: 'TaskResult' },
] as const;

type Phase = (typeof PHASES)[number]['id'];

const MOCK_RESULTS = [
  { answer: 'Вариант A', correct: true, explanation: 'Верный ответ: пояснение из data.ts.' },
  { answer: 'Вариант B', correct: false, explanation: 'Неверный ответ: пояснение из data.ts.' },
  { answer: 'Вариант C', correct: true, explanation: 'Ещё один верный ответ.' },
];

const PREVIEW_WIDTH = { landscape: 960, portrait: 540 } as const;

/**
 * Плейграунд заданий для /ui-kit: раздел → задание → фаза (intro / игра / мораль / результат).
 * Данные берутся из data.ts разделов, рендер — тем же GameRouter, что и на выставке.
 */
export function TaskPlayground() {
  const [sectionSlug, setSectionSlug] = useState(SECTIONS[4].slug);
  const [taskId, setTaskId] = useState<string>(SECTIONS[4].tasks[0].id);
  const [phase, setPhase] = useState<Phase>('game');
  const [runKey, setRunKey] = useState(0);

  const section = SECTIONS.find((s) => s.slug === sectionSlug) ?? SECTIONS[0];
  const task = section.tasks.find((t) => t.id === taskId) ?? section.tasks[0];

  const byMechanic = useMemo(() => {
    const map = new Map<string, Array<{ section: SectionData; task: Task }>>();
    for (const s of SECTIONS) {
      for (const t of s.tasks) {
        const list = map.get(t.mechanic) ?? [];
        list.push({ section: s, task: t });
        map.set(t.mechanic, list);
      }
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, []);

  const select = (s: SectionData, t: Task) => {
    setSectionSlug(s.slug);
    setTaskId(t.id);
    setRunKey((k) => k + 1);
  };

  const stageKey = `${section.slug}/${task.id}/${phase}/${runKey}`;

  return (
    <>
      <div className={styles.pickerRow}>
        {SECTIONS.map((s) => (
          <Button
            key={s.slug}
            label={`${s.title} · ${s.orientation === 'portrait' ? '9:16' : '16:9'} · ${s.theme}`}
            type="secondary"
            pressed={s.slug === section.slug}
            onClick={() => select(s, s.tasks[0])}
          />
        ))}
      </div>
      <div className={styles.pickerRow}>
        {section.tasks.map((t) => (
          <Button
            key={t.id}
            label={`${t.title} · ${t.mechanic}`}
            type="outline"
            pressed={t.id === task.id}
            onClick={() => select(section, t)}
          />
        ))}
      </div>
      <div className={styles.pickerRow}>
        {PHASES.map((p) => (
          <Button key={p.id} label={p.label} type="main" pressed={p.id === phase} onClick={() => setPhase(p.id)} />
        ))}
        <Button label="Перезапустить" type="secondary" onClick={() => setRunKey((k) => k + 1)} />
      </div>

      <p className={styles.pickerMeta}>
        {section.slug}/tasks/{task.id} · mechanic <code>{task.mechanic}</code> · theme {section.theme} ·{' '}
        {section.orientation}
      </p>

      <StagePreview key={stageKey} orientation={section.orientation} width={PREVIEW_WIDTH[section.orientation]}>
        {phase === 'intro' && (
          <TaskIntro
            task={task}
            onStart={() => setPhase('game')}
            onBack={() => {}}
            theme={section.theme}
            orientation={section.orientation}
          />
        )}
        {phase === 'game' && (
          <GameRouter
            task={task}
            onComplete={() => setPhase('moral')}
            onBack={() => setPhase('intro')}
            theme={section.theme}
            orientation={section.orientation}
          />
        )}
        {phase === 'moral' && (
          <TaskMoral
            task={task}
            onNext={() => setPhase('intro')}
            isLast={false}
            sectionSlug={section.slug}
            theme={section.theme}
            orientation={section.orientation}
            showTasksMenu={false}
          />
        )}
        {phase === 'result' && (
          <TaskResult
            results={MOCK_RESULTS}
            onContinue={() => setPhase('moral')}
            theme={section.theme}
            orientation={section.orientation}
          />
        )}
      </StagePreview>

      <h3 className={styles.subTitle}>Индекс механик</h3>
      <div className={styles.mechanicIndex}>
        {byMechanic.map(([mechanic, entries]) => (
          <div key={mechanic} className={styles.mechanicRow}>
            <code className={styles.mechanicName}>{mechanic}</code>
            <div className={styles.mechanicTasks}>
              {entries.map(({ section: s, task: t }) => (
                <button
                  key={`${s.slug}/${t.id}`}
                  type="button"
                  className={`${styles.mechanicLink} ${s.slug === section.slug && t.id === task.id ? styles.mechanicLinkActive : ''}`}
                  onClick={() => select(s, t)}
                >
                  {t.title} <span className={styles.mechanicSection}>{s.slug}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

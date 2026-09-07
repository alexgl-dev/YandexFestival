import { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { SectionData } from '../../types/game';
import { TaskIntro } from '../shared/TaskIntro';
import { TaskMoral } from '../shared/TaskMoral';
import { TaskResult } from '../shared/TaskResult';
import { GameRouter } from '../shared/GameRouter';
import styles from './TaskPage.module.css';

type Phase = 'intro' | 'game' | 'result' | 'moral';

type Result = {
  answer: string;
  correct: boolean;
  explanation: string;
};

export function TaskPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const data = useOutletContext<SectionData>();
  const task = data.tasks.find((tsk) => tsk.id === taskId);
  const { t } = useTranslation('development');

  const moralPreview = import.meta.env.DEV && searchParams.get('moral') === '1';

  const [phase, setPhase] = useState<Phase>(() => (moralPreview ? 'moral' : 'intro'));
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    setResults([]);
    setPhase(moralPreview ? 'moral' : 'intro');
  }, [taskId, moralPreview]);

  if (!task) {
    return <div className={styles.notFound}>{t("Задание не найдено")}</div>;
  }

  // Портрет: распределение задач, проверка безопасности, знакомство, собери код
  const orientation =
    task.id === 'task-distribution' ||
    task.id === 'security-check' ||
    task.id === 'languages-intro' ||
    task.id === 'shopping-list'
      ? 'portrait'
      : (data.orientation ?? 'landscape');

  const goToMenu = () => navigate(`/${data.slug}`);
  const goToNextTask = () => {
    const next = data.tasks.find((tsk) => tsk.order === task.order + 1);
    if (next) {
      navigate(`/${data.slug}/tasks/${next.id}`);
    } else {
      goToMenu();
    }
  };

  switch (phase) {
    case 'intro':
      return (
        <TaskIntro
          task={task}
          onStart={() => setPhase('game')}
          onBack={() => navigate(`/${data.slug}/tasks`)}
          theme={data.theme}
          orientation={orientation}
        />
      );
    case 'game':
      return (
        <GameRouter
          task={task}
          onBack={() => navigate(`/${data.slug}/tasks`)}
          onComplete={(r) => {
            setResults(r);
            const allCorrect = r.length > 0 && r.every((item) => item.correct);
            const pairCount = task.steps[0]?.pairs?.length ?? 0;
            const archaeologyWin =
              task.id === 'code-archaeology' &&
              pairCount > 0 &&
              r.filter((item) => item.correct).length >= pairCount;
            setPhase(
              allCorrect ||
                archaeologyWin ||
                task.id === 'backlog' ||
                task.id === 'security-check' ||
                task.id === 'languages-intro' ||
                task.id === 'shopping-list' ||
                task.id === 'dataset-sanitizers'
                ? 'moral'
                : 'result',
            );
          }}
          theme={data.theme}
          orientation={orientation}
        />
      );
    case 'result':
      return (
        <TaskResult
          results={results}
          onContinue={() => setPhase('moral')}
          theme={data.theme}
          orientation={orientation}
        />
      );
    case 'moral':
      return (
        <TaskMoral
          task={task}
          onNext={task.isLast ? goToMenu : goToNextTask}
          isLast={task.isLast}
          sectionSlug={data.slug}
          theme={data.theme}
          orientation={orientation}
        />
      );
  }
}

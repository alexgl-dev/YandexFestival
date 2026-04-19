import { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router';
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
  const data = useOutletContext<SectionData>();
  const task = data.tasks.find((t) => t.id === taskId);

  const [phase, setPhase] = useState<Phase>('intro');
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    setPhase('intro');
    setResults([]);
  }, [taskId]);

  if (!task) {
    return <div className={styles.notFound}>Задание не найдено</div>;
  }

  const goToMenu = () => navigate(`/${data.slug}`);
  const goToNextTask = () => {
    const next = data.tasks.find((t) => t.order === task.order + 1);
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
          onBack={() => navigate(-1)}
          theme={data.theme}
          orientation={data.orientation}
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
          orientation={data.orientation}
        />
      );
    case 'result':
      return (
        <TaskResult
          results={results}
          onContinue={() => setPhase('moral')}
          theme={data.theme}
          orientation={data.orientation}
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
          orientation={data.orientation}
        />
      );
  }
}

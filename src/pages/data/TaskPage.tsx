import { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router';
import type { SectionData } from '../../types/game';
import { TaskIntro } from '../shared/TaskIntro';
import { TaskInstruction } from '../shared/TaskInstruction';
import { TaskMoral } from '../shared/TaskMoral';
import { TaskResult } from '../shared/TaskResult';
import { GameRouter } from '../shared/GameRouter';
import styles from './TaskPage.module.css';

type Phase = 'intro' | 'instruction' | 'game' | 'result' | 'moral';

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
          onStart={() => setPhase(task.instruction && task.mechanic !== 'label' ? 'instruction' : 'game')}
          onBack={() => navigate(-1)}
          theme={data.theme}
          orientation={data.orientation}
        />
      );
    case 'instruction':
      return (
        <TaskInstruction
          instruction={task.instruction!}
          onContinue={() => setPhase('game')}
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
            setPhase(allCorrect ? 'moral' : 'result');
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

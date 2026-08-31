import { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router';
import type { SectionData } from '../../types/game';
import { TaskIntro } from '../shared/TaskIntro';
import { TaskMoral } from '../shared/TaskMoral';
import { GameRouter } from '../shared/GameRouter';

type Phase = 'intro' | 'game' | 'moral';

type Result = {
  answer: string;
  correct: boolean;
  explanation: string;
};

/**
 * Страница задания раздела «Информатика во всём».
 * Флоу по докам: Экран 1 (intro) → игра → финальное окно (moral) → в меню.
 * Экрана «результаты» нет — все механики трека дают фидбек внутри игры.
 */
export function InformaticsTaskPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const data = useOutletContext<SectionData>();
  const task = data.tasks.find((t) => t.id === taskId);

  const [phase, setPhase] = useState<Phase>('intro');
  const [, setResults] = useState<Result[]>([]);

  useEffect(() => {
    setPhase('intro');
    setResults([]);
  }, [taskId]);

  if (!task) {
    return <div>Задание не найдено</div>;
  }

  const goToMenu = () => navigate(`/${data.slug}`);

  switch (phase) {
    case 'intro':
      return (
        <TaskIntro
          task={task}
          onStart={() => setPhase('game')}
          onBack={goToMenu}
          theme={data.theme}
          orientation={data.orientation}
        />
      );
    case 'game':
      return (
        <GameRouter
          task={task}
          onBack={goToMenu}
          onComplete={(r) => {
            setResults(r);
            setPhase('moral');
          }}
          theme={data.theme}
          orientation={data.orientation}
        />
      );
    case 'moral':
      return (
        <TaskMoral
          task={task}
          onNext={goToMenu}
          isLast
          sectionSlug={data.slug}
          theme={data.theme}
          orientation={data.orientation}
        />
      );
  }
}

import { Background, PopUp } from '../../components/ui';
import styles from './TaskInstruction.module.css';

interface TaskInstructionProps {
  instruction: string;
  onContinue: () => void;
  theme?: 'cobalt' | 'orange';
  orientation?: 'landscape' | 'portrait';
}

export function TaskInstruction({ instruction, onContinue, theme = 'orange', orientation = 'portrait' }: TaskInstructionProps) {
  return (
    <Background theme={theme} orientation={orientation} showBackButton={false}>
      <div className={styles.wrapper}>
        <PopUp
          title="Инструкция"
          description={instruction}
          buttonLabel="Понятно"
          onButtonClick={onContinue}
        />
      </div>
    </Background>
  );
}

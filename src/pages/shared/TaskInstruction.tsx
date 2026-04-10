import { Background, PopUp } from '../../components/ui';
import styles from './TaskInstruction.module.css';

interface TaskInstructionProps {
  instruction: string;
  onContinue: () => void;
}

export function TaskInstruction({ instruction, onContinue }: TaskInstructionProps) {
  return (
    <Background theme="orange" orientation="landscape" showBackButton={false}>
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

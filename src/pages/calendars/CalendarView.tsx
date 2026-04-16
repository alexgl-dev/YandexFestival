import { useNavigate, useParams } from 'react-router';
import { CalendarViewGame } from '../shared/games/CalendarViewGame';
import { calendarsData } from './data';
import { Background } from '../../components/ui';

export function CalendarView() {
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();
  const data = section ? calendarsData[section] : undefined;

  if (!data) {
    return (
      <Background theme="cobalt" orientation="landscape" onBack={() => navigate('/calendars')}>
        <p style={{ color: 'white', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-xl)' }}>
          Календарь не найден
        </p>
      </Background>
    );
  }

  return (
    <CalendarViewGame
      title={data.title}
      days={data.days}
      cards={data.cards}
      theme={data.theme}
      startHour={data.startHour}
      slotCount={data.slotCount}
      onBack={() => navigate('/calendars')}
    />
  );
}

import { useNavigate, useParams } from 'react-router';
import { CalendarDayPortrait } from '../shared/games/CalendarDayPortrait';
import { calendarsData } from './data';
import { Background } from '../../components/ui';

export function CalendarView() {
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();
  const data = section ? calendarsData[section] : undefined;

  if (!data) {
    return (
      <Background theme="cobalt" orientation="portrait" onBack={() => navigate('/calendars')}>
        <p style={{ color: 'white', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-xl)' }}>
          Календарь не найден
        </p>
      </Background>
    );
  }

  return (
    <CalendarDayPortrait
      cards={data.cards}
      theme="cobalt"
      startHour={data.startHour}
      slotCount={data.slotCount}
      onBack={() => navigate('/calendars')}
    />
  );
}

import { useNavigate, useParams } from 'react-router';
import { CalendarDayPortrait } from '../shared/games/CalendarDayPortrait';
import { calendarsData } from './data';
import { Background } from '../../components/ui';

export function CalendarView() {
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();
  const data = section ? calendarsData[section] : undefined;
  const sectionLabel =
    section === 'development' ? 'Разработка' :
    section === 'data' ? 'Работа с данными' :
    section === 'creative' ? 'Креатив' :
    section === 'management' ? 'Менеджмент' :
    null;

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
      topText={'Загляни в календари сотрудников разных направлений и узнай, как проходит их день. Отмечай, в чем их отличия? Как тебе кажется, с чем это связано?'}
      bottomText={'Чей рабочий день отозвался тебе больше других? Почему?'}
      bottomTextItalic={`Ты можешь изучить секцию «${sectionLabel ?? '…'}» во Вселенной профессий подробнее, чтобы узнать специфику работы в этом направлении.`}
    />
  );
}

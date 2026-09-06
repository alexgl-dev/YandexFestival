import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { CalendarDayPortrait } from '../shared/games/CalendarDayPortrait';
import { calendarsData } from './data';
import { Background } from '../../components/ui';

export function CalendarView() {
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('calendars');
  const data = section ? calendarsData[section] : undefined;
  const sectionLabel =
    section === 'development' ? t('Разработка') :
    section === 'data' ? t('Работа с данными') :
    section === 'creative' ? t('Креатив') :
    section === 'management' ? t('Менеджмент') :
    null;

  if (!data) {
    return (
      <Background theme="cobalt" orientation="portrait" onBack={() => navigate('/calendars')}>
        <p style={{ color: 'white', fontFamily: 'var(--font-family-text)', fontSize: 'var(--font-size-xl)' }}>
          {t('Календарь не найден')}
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
      topText={t('Загляни в календари сотрудников разных направлений и узнай, как проходит их день. Отмечай, в чем их отличия? Как тебе кажется, с чем это связано?')}
      bottomText={t('Чей рабочий день отозвался тебе больше других? Почему?')}
      bottomTextItalic={t('Ты можешь изучить секцию «{{sectionLabel}}» во Вселенной профессий подробнее, чтобы узнать специфику работы в этом направлении.', { sectionLabel: sectionLabel ?? '…' })}
    />
  );
}

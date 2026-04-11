import { Outlet } from 'react-router';
import { developmentSection } from './data';

export function DevelopmentLayout() {
  return <Outlet context={developmentSection} />;
}

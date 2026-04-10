import { Outlet } from 'react-router';
import { creativeSection } from './data';

export function CreativeLayout() {
  return <Outlet context={creativeSection} />;
}

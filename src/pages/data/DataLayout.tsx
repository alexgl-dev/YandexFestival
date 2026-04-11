import { Outlet } from 'react-router';
import { dataSection } from './data';

export function DataLayout() {
  return <Outlet context={dataSection} />;
}

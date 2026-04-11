import { Outlet } from 'react-router';
import { managementSection } from './data';

export function ManagementLayout() {
  return <Outlet context={managementSection} />;
}

import { Redirect } from 'expo-router';
import { useAuth } from '../features/auth';
import { routeForAuthStatus } from './route-state';

export default function Index() {
  const { status } = useAuth();
  const route = routeForAuthStatus(status);
  return route ? <Redirect href={route} /> : null;
}

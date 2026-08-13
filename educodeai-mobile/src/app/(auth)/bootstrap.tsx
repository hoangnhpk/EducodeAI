import { useAuth } from '../../features/auth/hooks/use-auth';
import { BootstrapScreen } from '../../features/auth/screens/bootstrap.screen';

export default function BootstrapRoute() {
  const { error, retryBootstrap } = useAuth();
  return <BootstrapScreen error={error} onRetry={() => void retryBootstrap()} />;
}

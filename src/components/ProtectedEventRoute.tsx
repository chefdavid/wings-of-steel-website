import { Navigate } from 'react-router-dom';
import { useEventVisibility } from '../hooks/useEventVisibility';
import LoadingSpinner from './LoadingSpinner';
import { isDevPreview } from '../utils/devPreview';

interface ProtectedEventRouteProps {
  eventKey: string;
  children: React.ReactNode;
}

const ProtectedEventRoute = ({ eventKey, children }: ProtectedEventRouteProps) => {
  const { isEventVisible, loading } = useEventVisibility();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isEventVisible(eventKey) && !isDevPreview()) {
    // Redirect to home if event is not visible
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedEventRoute;


import { Navigate } from 'react-router-dom';
import { useEventVisibility } from '../hooks/useEventVisibility';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedEventRouteProps {
  eventKey: string;
  children: React.ReactNode;
}

const ProtectedEventRoute = ({ eventKey, children }: ProtectedEventRouteProps) => {
  const { isEventVisible, loading } = useEventVisibility();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isEventVisible(eventKey)) {
    // Redirect to home if event is not visible
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedEventRoute;


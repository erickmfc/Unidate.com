import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logSiteActivity } from '../services/activityLogService';

const SiteActivityTracker: React.FC = () => {
  const { pathname } = useLocation();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser?.id) {
      void logSiteActivity(currentUser.id, 'page_view', pathname);
    }
  }, [currentUser?.id, pathname]);

  return null;
};

export default SiteActivityTracker;

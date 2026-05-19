import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Analytics = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate('/account/statistics', { replace: true }); }, [navigate]);
  return null;
};

export default Analytics;

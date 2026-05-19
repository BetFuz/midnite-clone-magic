import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PlayerProtection = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate('/account/limits', { replace: true }); }, [navigate]);
  return null;
};

export default PlayerProtection;

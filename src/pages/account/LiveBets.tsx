import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LiveBets = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate('/account/bet-tickets', { replace: true }); }, [navigate]);
  return null;
};

export default LiveBets;

import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function Join() {
  const [params] = useSearchParams();
  const navigate  = useNavigate();
  const ref       = params.get('ref');

  useEffect(() => {
    if (ref) {
      sessionStorage.setItem('betfuz_ref', ref);
    }
    navigate('/auth', { replace: true });
  }, [ref, navigate]);

  return null;
}

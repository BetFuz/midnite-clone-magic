import { useState } from 'react';

export const useRealtimeBetUpdates = () => {
  const [updates, setUpdates] = useState<any[]>([]);
  return { updates, isConnected: false, clearUpdates: () => setUpdates([]) };
};

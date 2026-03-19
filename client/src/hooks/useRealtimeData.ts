import { useEffect, useState, useCallback } from 'react';
import realtimeService from '../services/realtimeService';

export const useRealtimeData = (event: string, initialData: any = null) => {
  const [data, setData] = useState(initialData);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to real-time service
    realtimeService.connect();
    setIsConnected(true);

    // Subscribe to event
    const unsubscribe = realtimeService.on(event, (newData: any) => {
      setData(newData);
    });

    return () => {
      unsubscribe();
    };
  }, [event]);

  const updateData = useCallback((newData: any) => {
    setData(newData);
    realtimeService.emitEvent(event, newData);
  }, [event]);

  return { data, isConnected, updateData };
};

export default useRealtimeData;

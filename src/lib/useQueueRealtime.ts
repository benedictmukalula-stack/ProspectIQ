'use client';

import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export function useQueueRealtime(initial: any[] = []) {
  const [queue, setQueue] = useState(initial);

  useEffect(() => {
    const channel = supabase
      .channel('queue-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue',
        },
        (payload) => {
          const newRow = payload.new;

          setQueue((current) => {
            const exists = current.find((q: any) => q.id === newRow.id);

            if (exists) {
              return current.map((q: any) =>
                q.id === newRow.id ? newRow : q
              );
            }

            return [newRow, ...current];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return queue;
}

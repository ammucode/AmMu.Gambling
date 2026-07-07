'use client';

import { useEffect } from 'react';
import { useHeader } from './context';

type HeaderItemProps = {
  id: string;
  children: React.ReactNode;
};

export default function HeaderItem({ id, children }: HeaderItemProps) {
  const { registerItem, unregisterItem } = useHeader();

  useEffect(() => {
    registerItem(id, children);
    return () => unregisterItem(id);
  }, [id, children, registerItem, unregisterItem]);

  return null;
}
"use client";

import { useState } from 'react';
import { GameProps } from '../../types';

export function EasyCraps({}: GameProps) {
  const [money, setMoney] = useState(100);

  return (<>
    {money}
  </>);
}

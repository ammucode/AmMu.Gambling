'use client';

import { useState } from 'react';
import { GameProps } from '../../types';
import { MoneyStats } from '@/components/blocks/games/money-stats';

// export interface EasyCrapsProps extends GameProps {}
export type EasyCrapsProps = GameProps;
export function EasyCraps({}: EasyCrapsProps) {
  const [money, setMoney] = useState(100);

  /*
  22 rows: 8 - point area, 1 gap, 10 - field/passline, 1 gap, 2 - roll history
     rows: 19 hardways/hops
  14 cols: 4 - hardways/hops, 10 - point area
     cols:                  , 3 - C/E, 7 - field/passline
  */

  return (
    <>
      <div className="absolute top-0 right-0 h-16">
        <MoneyStats
          playable={money}
          bet={0}
          lastResult={{ bet: 10, win: 50 }}
        />
      </div>
      <div className="absolute bottom-0 hidden aspect-2/1 max-h-[calc(100%-72px)] max-w-full min-w-[80%] grid-cols-14 grid-rows-22 bg-gray-800/30 md:grid">
        <div className="col-span-4 col-start-1 row-span-19 row-start-1 grid bg-gray-800/30">
          hard
        </div>
        <div className="col-span-10 col-start-5 row-span-8 row-start-1 -mb-2 grid bg-gray-800/30">
          point/buy
        </div>
        <div className="col-span-3 col-start-5 row-span-10 row-start-10 grid bg-gray-800/30">
          C/E
        </div>
        <div
          className="col-span-7 col-start-8 row-span-10 row-start-10 grid bg-gray-800/30"
          onClick={() => setMoney((m) => m - 1)}
        >
          field/passline
        </div>
        <div className="col-span-14 col-start-1 row-span-2 row-start-21 -mt-2 grid bg-gray-800/30">
          history
        </div>
      </div>
    </>
  );
}

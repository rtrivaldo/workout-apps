'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import FoodAddButton from './FoodAddButton';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

type FoodItem = {
  id: number;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  serving: string;
  createdBy: number | null;
};

type Props = {
  foods: FoodItem[];
  manageHref?: string;
};

export default function FoodLibraryTable({ foods, manageHref }: Props) {
  const [search, setSearch] = useState('');
  const filteredFoods = useMemo(() => {
    if (!search) return foods;
    return foods.filter(food =>
      food.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [foods, search]);

  return (
    <TooltipProvider delayDuration={100}>
      <div className='bg-white rounded-xl p-4 space-y-4 flex flex-col h-full border border-neutral-100'>
        <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <div>
            <h3 className='text-lg font-semibold'>Food Library</h3>
            <p className='text-sm text-neutral-500'>
              Search and manage foods for your meals.
            </p>
            <p className='text-xs text-neutral-500 mt-1'>
              Editing entries is available through the Manage Library page.
            </p>
          </div>
          <div className='flex items-center gap-2'>
            {manageHref && (
              <Link
                href={manageHref}
                className='text-sm text-neutral-600 hover:text-neutral-900 underline'
              >
                Manage Library
              </Link>
            )}
            <FoodAddButton />
          </div>
        </div>

        <Input
          placeholder='Search food...'
          value={search}
          onChange={event => setSearch(event.target.value)}
          className='md:max-w-sm'
        />

        <div className='hidden md:block overflow-x-auto flex-1'>
          <table className='w-full text-sm min-w-[640px] table-fixed'>
            <colgroup>
              <col className='w-[38%]' />
              <col className='w-[22%]' />
              <col className='w-[15%]' />
              <col className='w-[25%]' />
            </colgroup>
            <thead>
              <tr className='text-left text-neutral-500'>
                <th className='py-2 pr-4 text-nowrap'>
                  <div className='inline-flex items-center gap-1'>
                    Name
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className='h-4 w-4 text-neutral-400 cursor-pointer' />
                      </TooltipTrigger>
                      <TooltipContent className='w-56 text-xs text-white bg-neutral-900'>
                        Items with the <span className='font-semibold'>Personal</span> badge
                        are created by you and can be edited. Catalog items are read-only.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className='py-2 px-4 text-nowrap'>Serving</th>
                <th className='py-2 px-4 text-nowrap'>Calories</th>
                <th className='py-2 pl-4 text-nowrap'>Macros (P/C/F)</th>
              </tr>
            </thead>
            <tbody>
              {filteredFoods.map(food => (
                <tr key={food.id} className='border-t align-top'>
                  <td className='py-3 pr-4'>
                    <div className='font-medium text-neutral-900 break-words'>
                      {food.name}
                    </div>
                    {food.createdBy && (
                      <span className='inline-flex items-center text-xs text-green-700'>
                        Personal
                      </span>
                    )}
                  </td>
                  <td className='py-3 px-4 text-sm text-neutral-700'>
                    <div className='max-w-[160px] break-words leading-snug'>
                      {food.serving}
                    </div>
                  </td>
                  <td className='py-3 px-4 text-sm text-neutral-700'>
                    <div className='max-w-[120px] break-words leading-snug'>
                      {food.calories} kcal
                    </div>
                  </td>
                  <td className='py-3 pl-4 text-sm text-neutral-700'>
                    <div className='flex flex-col gap-0.5 leading-snug'>
                      <span>P {food.protein}g</span>
                      <span>C {food.carbs}g</span>
                      <span>F {food.fat}g</span>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredFoods.length && (
                <tr>
                  <td className='py-4 text-center text-neutral-500' colSpan={4}>
                    No food found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className='md:hidden flex-1 space-y-3'>
          {filteredFoods.map(food => (
            <div
              key={`food-card-${food.id}`}
              className='border border-neutral-100 rounded-lg p-4 space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='font-semibold text-neutral-900 break-words'>{food.name}</p>
                  <span
                    className={cn(
                      'mt-1 inline-flex items-center text-xs px-2 py-0.5 rounded-full',
                      food.createdBy
                        ? 'bg-green-100 text-green-700'
                        : 'bg-neutral-100 text-neutral-600'
                    )}
                  >
                    {food.createdBy ? 'Personal' : 'Catalog'}
                  </span>
                </div>
                {manageHref && (
                  <Link
                    href={manageHref}
                    className='text-xs font-medium text-neutral-500 underline'
                  >
                    Manage
                  </Link>
                )}
              </div>
              <dl className='grid grid-cols-2 gap-3 text-sm text-neutral-600'>
                <div>
                  <dt className='text-xs uppercase tracking-wide text-neutral-500'>Serving</dt>
                  <dd className='text-neutral-900 break-words leading-snug'>{food.serving}</dd>
                </div>
                <div>
                  <dt className='text-xs uppercase tracking-wide text-neutral-500'>Calories</dt>
                  <dd className='text-neutral-900'>{food.calories} kcal</dd>
                </div>
                <div className='col-span-2'>
                  <dt className='text-xs uppercase tracking-wide text-neutral-500'>Macros</dt>
                  <dd className='text-neutral-900'>
                    P {food.protein}g / C {food.carbs}g / F {food.fat}g
                  </dd>
                </div>
              </dl>
            </div>
          ))}
          {!filteredFoods.length && (
            <div className='py-4 text-center text-neutral-500 border border-dashed border-neutral-200 rounded-lg'>
              No food found.
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

import { requireCompleteProfile } from '@/actions/auth/profile';
import FoodService from '@/actions/diet/FoodService';
import BackNavigationButton from '@/components/BackNavigationButton';
import FoodAddButton from '@/components/diet/FoodAddButton';
import FoodRowActions from '@/components/diet/FoodRowActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import Link from 'next/link';

const foodService = new FoodService();
const PAGE_SIZE = 10;

type SearchParams = {
  search?: string;
  page?: string;
  source?: string;
};

export default async function FoodLibraryManagePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requireCompleteProfile();

  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search : '';
  const sourceParam =
    typeof params.source === 'string' ? params.source : 'all';
  const source =
    sourceParam === 'catalog' || sourceParam === 'personal'
      ? sourceParam
      : 'all';

  const pageParam =
    typeof params.page === 'string' ? Number(params.page) : 1;
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const skip = (page - 1) * PAGE_SIZE;

  const [foods, total] = await Promise.all([
    foodService.getAllFoods(user.id, {
      search: search || undefined,
      source,
      take: PAGE_SIZE,
      skip,
    }),
    foodService.countFoods(user.id, {
      search: search || undefined,
      source,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildPageLink = (pageNumber: number) => {
    const query = new URLSearchParams();
    if (search) query.set('search', search);
    if (source !== 'all') query.set('source', source);
    query.set('page', String(pageNumber));
    return `/diet-plan/foods?${query.toString()}`;
  };

  return (
    <div className='mt-6 p-6 md:p-10 bg-[#F4F6F6] rounded-2xl space-y-6'>
      <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
        <div>
          <BackNavigationButton className='mb-1' fallbackHref='/diet-plan' label='Back to Diet Plan' />
          <h2 className='text-2xl font-semibold'>Manage Food Library</h2>
          <p className='text-sm text-[#A9A9A9]'>
            View, search, and maintain your food library.
          </p>
        </div>
        <FoodAddButton triggerLabel='Add Food' />
      </div>

      <form
        className='bg-white rounded-xl p-4 grid gap-4 md:grid-cols-[2fr_1fr_auto]'
        action='/diet-plan/foods'
      >
        <Input
          placeholder='Search food name...'
          name='search'
          defaultValue={search}
        />
        <select
          name='source'
          defaultValue={source}
          className='border rounded-md px-3 py-2 bg-white text-sm'
        >
          <option value='all'>All Foods</option>
          <option value='catalog'>Catalog Foods</option>
          <option value='personal'>My Personal Foods</option>
        </select>
        <div className='flex items-center gap-2'>
          <input type='hidden' name='page' value='1' />
          <Button type='submit'>Apply</Button>
          {search || source !== 'all' ? (
            <Link href='/diet-plan/foods' className='text-sm underline'>
              Reset
            </Link>
          ) : null}
        </div>
      </form>

      <div className='bg-white rounded-xl p-4 min-h-[430px] flex flex-col'>
        <TooltipProvider delayDuration={100}>
          <div className='hidden md:block overflow-x-auto flex-1'>
            <table className='w-full text-sm min-w-[960px]'>
              <thead>
                <tr className='text-left text-neutral-500'>
                  <th className='py-2 px-2 w-12 text-nowrap'>#</th>
                  <th className='py-2 px-2 text-nowrap'>Name</th>
                  <th className='py-2 px-2 text-nowrap'>Serving</th>
                  <th className='py-2 px-2 text-nowrap'>Calories</th>
                  <th className='py-2 px-2 text-nowrap'>Macros (P/C/F)</th>
                  <th className='py-2 px-2 text-nowrap'>
                    <div className='inline-flex items-center gap-1'>
                      Type
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className='h-4 w-4 text-neutral-400 cursor-pointer' />
                        </TooltipTrigger>
                        <TooltipContent className='w-60 text-xs text-white bg-neutral-900'>
                          <span className='font-semibold'>Catalog</span> items come from the system.
                          <span className='font-semibold'> Personal</span> items are created by you and can be edited or deleted.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </th>
                  <th className='py-2 px-2 text-right text-nowrap'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {foods.map((food, index) => {
                  const rowNumber = skip + index + 1;
                  const isPersonal = Boolean(food.createdBy);
                  return (
                    <tr key={food.id} className='border-t'>
                      <td className='py-2 px-2 text-neutral-500 whitespace-nowrap'>{rowNumber}</td>
                      <td className='py-2 px-2'>{food.name}</td>
                      <td className='py-2 px-2'>
                        <div className='max-w-[200px] break-words leading-snug'>
                          {food.serving}
                        </div>
                      </td>
                      <td className='py-2 px-2'>
                        <div className='max-w-[140px] break-words leading-snug'>
                          {food.calories} kcal
                        </div>
                      </td>
                      <td className='py-2 px-2 align-top'>
                        <div className='flex flex-col gap-0.5 leading-snug text-nowrap'>
                          <span>P {food.protein}g</span>
                          <span>C {food.carbs}g</span>
                          <span>F {food.fat}g</span>
                        </div>
                      </td>
                      <td className='py-2 px-2'>
                        <span
                          className={cn(
                            'px-2 py-1 text-xs rounded-full whitespace-nowrap',
                            isPersonal
                              ? 'bg-green-100 text-green-700'
                              : 'bg-neutral-100 text-neutral-600'
                          )}
                        >
                          {isPersonal ? 'Personal' : 'Catalog'}
                        </span>
                      </td>
                      <td className='py-2 px-2 text-right'>
                        <FoodRowActions food={food} />
                      </td>
                    </tr>
                  );
                })}
                {foods.length === 0 && (
                  <tr>
                    <td className='py-6 text-center text-neutral-500' colSpan={7}>
                      No foods found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className='md:hidden flex-1 space-y-3'>
            {foods.map((food, index) => {
              const rowNumber = skip + index + 1;
              const isPersonal = Boolean(food.createdBy);
              return (
                <div
                  key={`card-${food.id}`}
                  className='border border-neutral-100 rounded-lg p-4 space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <p className='text-xs text-neutral-500'>#{rowNumber}</p>
                      <p className='font-semibold text-neutral-900'>{food.name}</p>
                      <span
                        className={cn(
                          'mt-1 inline-flex items-center text-xs px-2 py-0.5 rounded-full',
                          isPersonal
                            ? 'bg-green-100 text-green-700'
                            : 'bg-neutral-100 text-neutral-600'
                        )}
                      >
                        {isPersonal ? 'Personal' : 'Catalog'}
                      </span>
                    </div>
                    <FoodRowActions food={food} />
                  </div>
                  <dl className='grid grid-cols-2 gap-3 text-sm text-neutral-600'>
                    <div>
                      <dt className='text-xs uppercase tracking-wide text-neutral-500'>Serving</dt>
                      <dd className='text-neutral-900 break-words leading-snug'>
                        {food.serving}
                      </dd>
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
              );
            })}
            {foods.length === 0 && (
              <div className='py-6 text-center text-neutral-500 border border-dashed border-neutral-200 rounded-lg'>
                No foods found.
              </div>
            )}
          </div>
        </TooltipProvider>
      </div>

      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <span className='text-sm text-neutral-600'>
          Page {page} of {totalPages} • {total} items
        </span>

        <div className='flex items-center gap-2'>
          {page === 1 ? (
            <Button variant='outline' disabled>
              Previous
            </Button>
          ) : (
            <Button variant='outline' asChild>
              <Link href={buildPageLink(page - 1)}>Previous</Link>
            </Button>
          )}

          {page === totalPages ? (
            <Button variant='outline' disabled>
              Next
            </Button>
          ) : (
            <Button variant='outline' asChild>
              <Link href={buildPageLink(page + 1)}>Next</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

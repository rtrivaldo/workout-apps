'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import DailyCheckInForm from './DailyCheckInForm';
import { FitnessGoal } from '@prisma/client';

type DailyCheckInDefaults = {
  weight?: number;
  targetWeight?: number;
  manualCalorieTarget?: number;
  fitnessGoal: FitnessGoal;
};

export default function DailyCheckInDialog({
  defaultValues,
  recommendedCalories,
  currentWeight,
}: {
  defaultValues: DailyCheckInDefaults;
  recommendedCalories?: number | null;
  currentWeight?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>Daily Check-in</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Daily Check-in</DialogTitle>
          <DialogDescription>
            Update today&apos;s weight and adjust your goal settings.
          </DialogDescription>
        </DialogHeader>
        <DailyCheckInForm
          defaultValues={defaultValues}
          recommendedCalories={recommendedCalories}
          currentWeight={currentWeight}
          onCompleted={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

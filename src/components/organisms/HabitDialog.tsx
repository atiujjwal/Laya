'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createHabitSchema } from '@/lib/validations'; // From Phase 5
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/atoms/dialog';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/Select';
import { Loader2, Plus } from 'lucide-react';

interface HabitDialogProps {
  mode?: 'create' | 'edit';
  initialData?: any; // Pass habit object if editing
  trigger?: React.ReactNode;
}

export const HabitDialog: React.FC<HabitDialogProps> = ({
  mode = 'create',
  initialData,
  trigger,
}) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(createHabitSchema),
    defaultValues: initialData || {
      title: '',
      frequency: 'DAILY',
      targetValue: 1,
      unit: 'times',
      color: '#000000',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const url =
        mode === 'create' ? '/api/habits' : `/api/habits/${initialData.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to save habit');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      setOpen(false);
      form.reset();
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Add Habit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'New Habit' : 'Edit Habit'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label>Habit Title</Label>
            <Input
              {...form.register('title')}
              placeholder="e.g. Read 30 mins"
            />
            {form.formState.errors.title && (
              <p className="text-red-500 text-xs">
                {form.formState.errors.title.message as string}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Frequency */}
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                onValueChange={(val) => form.setValue('frequency', val as any)}
                defaultValue={form.getValues('frequency')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Color Picker (Simple Input for now) */}
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  className="w-12 h-10 p-1"
                  {...form.register('color')}
                />
                <Input {...form.register('color')} placeholder="#000000" />
              </div>
            </div>
          </div>

          {/* Target */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Target</Label>
              <Input
                type="number"
                {...form.register('targetValue', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input {...form.register('unit')} placeholder="e.g. pages" />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {mode === 'create' ? 'Create Habit' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

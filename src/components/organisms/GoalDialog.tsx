'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createGoalSchema } from '@/lib/validations';
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
import { Plus, Trash2, Loader2 } from 'lucide-react';

export const GoalDialog = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      title: '',
      category: 'Personal Growth',
      steps: [{ step: '', done: false }], // Start with 1 empty step
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'steps',
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/goals', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setOpen(false);
      form.reset();
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> New Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Set a New Goal</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
          className="space-y-4 pt-4"
        >
          <div className="space-y-2">
            <Label>Goal Title</Label>
            <Input
              {...form.register('title')}
              placeholder="e.g. Run a Marathon"
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Input {...form.register('category')} placeholder="e.g. Health" />
          </div>

          {/* Dynamic Steps List */}
          <div className="space-y-2">
            <Label>Actionable Steps</Label>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input
                    {...form.register(`steps.${index}.step` as const)}
                    placeholder={`Step ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="shrink-0 text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ step: '', done: false })}
              className="w-full mt-2"
            >
              <Plus className="w-3 h-3 mr-2" /> Add Step
            </Button>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Create Goal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

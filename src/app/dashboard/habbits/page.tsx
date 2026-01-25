'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AddHabitDialog } from '@/components/organisms/AddHabitDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Archive,
  Loader2,
} from 'lucide-react';
import {
  AreaOfLifeBadge,
  AreaType,
} from '@/components/molecules/AreaOfLifeBadge';
import { toast } from '@/components/ui/use-toast';
import { Habit } from '@/types/habit';

export default function HabitsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch Habits
  const { data: habits = [], isLoading } = useQuery<Habit[]>({
    queryKey: ['habits'],
    queryFn: async () => {
      const res = await fetch('/api/habits');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  // Delete Mutation
  const deleteHabit = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast({ title: 'Habit deleted' });
    },
    onError: () =>
      toast({ title: 'Error deleting habit', variant: 'destructive' }),
  });

  // Filter Logic
  const filteredHabits = habits.filter(
    (h) =>
      h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">
            Manage Habits
          </h1>
          <p className="text-muted-foreground">
            View and edit your habit configurations.
          </p>
        </div>
        <AddHabitDialog />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground ml-2" />
        <Input
          placeholder="Search habits..."
          className="border-0 focus-visible:ring-0 shadow-none max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Habit Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Current Streak</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredHabits.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No habits found. Add one above!
                </TableCell>
              </TableRow>
            ) : (
              filteredHabits.map((habit) => (
                <TableRow key={habit.id}>
                  <TableCell className="font-medium">{habit.title}</TableCell>
                  <TableCell>
                    <AreaOfLifeBadge area={habit.category as AreaType} />
                  </TableCell>
                  <TableCell className="capitalize">
                    {habit.frequency}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">
                        {habit.streak}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        days
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            toast({ title: 'Edit functionality coming soon' })
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => deleteHabit.mutate(habit.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

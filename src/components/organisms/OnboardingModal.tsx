'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2, LayoutDashboard, Target } from 'lucide-react';

export function OnboardingModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check local storage to see if user has seen this
    const hasSeen = localStorage.getItem('laya_onboarding_seen');
    if (!hasSeen) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem('laya_onboarding_seen', 'true');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-primary">
            Welcome to Laya!
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            Let's get you set up for success in 3 simple steps.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-6 py-8">
          {/* Step 1 */}
          <div className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">1. Add Habits</h3>
            <p className="text-sm text-muted-foreground">
              Create daily habits you want to track on your main dashboard.
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">2. Check In Daily</h3>
            <p className="text-sm text-muted-foreground">
              Click the grid cells to mark habits complete. Watch your streaks
              grow!
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">3. Set Big Goals</h3>
            <p className="text-sm text-muted-foreground">
              Use the Goals tab to break down big aspirations into actionable
              steps.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleClose}
            size="lg"
            className="w-full md:w-1/3 bg-primary text-white"
          >
            Let's Go!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

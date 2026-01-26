'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
}

interface MagicOnboardingProps {
  isOpen: boolean;
  onComplete: (data: OnboardingData) => void;
}

export interface OnboardingData {
  goals: string[];
  habits: Array<{ title: string; time: string; category: string }>;
  preferences: {
    wakeTime: string;
    sleepTime: string;
    workHours: string;
  };
}

export const MagicOnboarding: React.FC<MagicOnboardingProps> = ({
  isOpen,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingData>({
    goals: [],
    habits: [],
    preferences: {
      wakeTime: '07:00',
      sleepTime: '23:00',
      workHours: '09:00-17:00',
    },
  });

  const steps: OnboardingStep[] = [
    {
      id: 'goals',
      title: 'What are your goals?',
      description: 'Tell us what you want to achieve',
      component: (
        <GoalsStep
          goals={formData.goals}
          onGoalsChange={(goals) => setFormData({ ...formData, goals })}
        />
      ),
    },
    {
      id: 'habits',
      title: 'What habits do you want to build?',
      description: 'Add habits you want to track daily',
      component: (
        <HabitsStep
          habits={formData.habits}
          onHabitsChange={(habits) => setFormData({ ...formData, habits })}
        />
      ),
    },
    {
      id: 'preferences',
      title: 'When are you most productive?',
      description: 'Help us schedule your day optimally',
      component: (
        <PreferencesStep
          preferences={formData.preferences}
          onPreferencesChange={(preferences) =>
            setFormData({ ...formData, preferences })
          }
        />
      ),
    },
    {
      id: 'preview',
      title: 'Your personalized plan is ready!',
      description: 'Review your daily schedule',
      component: <PreviewStep data={formData} />,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {steps[currentStep].title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {steps[currentStep].description}
          </p>
        </DialogHeader>

        <div className="py-6">{steps[currentStep].component}</div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  index <= currentStep
                    ? 'bg-primary'
                    : 'bg-muted'
                )}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? (
                <>
                  Complete Setup
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Step Components
const GoalsStep: React.FC<{
  goals: string[];
  onGoalsChange: (goals: string[]) => void;
}> = ({ goals, onGoalsChange }) => {
  const [input, setInput] = useState('');

  const addGoal = () => {
    if (input.trim()) {
      onGoalsChange([...goals, input.trim()]);
      setInput('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="e.g., Run a marathon, Learn Spanish..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addGoal()}
        />
        <Button onClick={addGoal}>Add</Button>
      </div>

      <div className="space-y-2">
        {goals.map((goal, index) => (
          <Card key={index}>
            <CardContent className="p-3 flex items-center justify-between">
              <span>{goal}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onGoalsChange(goals.filter((_, i) => i !== index))}
              >
                ×
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const HabitsStep: React.FC<{
  habits: Array<{ title: string; time: string; category: string }>;
  onHabitsChange: (habits: Array<{ title: string; time: string; category: string }>) => void;
}> = ({ habits, onHabitsChange }) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:00');
  const [category, setCategory] = useState('health');

  const addHabit = () => {
    if (title.trim()) {
      onHabitsChange([...habits, { title: title.trim(), time, category }]);
      setTitle('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <Input
          placeholder="Habit name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="health">Health</option>
          <option value="work">Work</option>
          <option value="personal">Personal</option>
          <option value="learning">Learning</option>
        </select>
      </div>

      <Button onClick={addHabit} className="w-full">
        Add Habit
      </Button>

      <div className="space-y-2">
        {habits.map((habit, index) => (
          <Card key={index}>
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <span className="font-medium">{habit.title}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  {habit.time} • {habit.category}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onHabitsChange(habits.filter((_, i) => i !== index))}
              >
                ×
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const PreferencesStep: React.FC<{
  preferences: { wakeTime: string; sleepTime: string; workHours: string };
  onPreferencesChange: (preferences: any) => void;
}> = ({ preferences, onPreferencesChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Wake Time</Label>
        <Input
          type="time"
          value={preferences.wakeTime}
          onChange={(e) =>
            onPreferencesChange({ ...preferences, wakeTime: e.target.value })
          }
        />
      </div>

      <div>
        <Label>Sleep Time</Label>
        <Input
          type="time"
          value={preferences.sleepTime}
          onChange={(e) =>
            onPreferencesChange({ ...preferences, sleepTime: e.target.value })
          }
        />
      </div>

      <div>
        <Label>Work Hours (e.g., 09:00-17:00)</Label>
        <Input
          value={preferences.workHours}
          onChange={(e) =>
            onPreferencesChange({ ...preferences, workHours: e.target.value })
          }
          placeholder="09:00-17:00"
        />
      </div>
    </div>
  );
};

const PreviewStep: React.FC<{ data: OnboardingData }> = ({ data }) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">Your Goals</h3>
          <ul className="list-disc list-inside space-y-1">
            {data.goals.map((goal, i) => (
              <li key={i}>{goal}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">Your Habits</h3>
          <ul className="space-y-2">
            {data.habits.map((habit, i) => (
              <li key={i} className="flex items-center justify-between">
                <span>{habit.title}</span>
                <span className="text-sm text-muted-foreground">
                  {habit.time} • {habit.category}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">Your Preferences</h3>
          <div className="space-y-1 text-sm">
            <p>Wake: {data.preferences.wakeTime}</p>
            <p>Sleep: {data.preferences.sleepTime}</p>
            <p>Work: {data.preferences.workHours}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

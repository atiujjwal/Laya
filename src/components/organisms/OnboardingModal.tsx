'use client';

import { useState, useEffect } from 'react';
import { MagicOnboarding, OnboardingData } from './MagicOnboarding';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Check if user needs onboarding
    const hasCompletedOnboarding = localStorage.getItem('laya_onboarding_completed');
    const userNeedsOnboarding = session?.user && !hasCompletedOnboarding;
    
    if (userNeedsOnboarding) {
      setIsOpen(true);
    }
  }, [session]);

  const handleComplete = async (data: OnboardingData) => {
    try {
      // Send onboarding data to API to create initial habits and goals
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        localStorage.setItem('laya_onboarding_completed', 'true');
        setIsOpen(false);
        router.refresh(); // Refresh to show new data
      } else {
        console.error('Failed to save onboarding data');
      }
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  return <MagicOnboarding isOpen={isOpen} onComplete={handleComplete} />;
}

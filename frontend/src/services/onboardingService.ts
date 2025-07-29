/**
 * Service to manage onboarding state for users
 */

const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';

/**
 * Check if the user has completed the onboarding process
 * @returns boolean indicating if onboarding has been completed
 */
export const hasCompletedOnboarding = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
};

/**
 * Mark the onboarding process as completed for the current user
 */
export const markOnboardingCompleted = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
};

/**
 * Reset the onboarding state (for testing or if a user wants to see the onboarding again)
 */
export const resetOnboardingState = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
};

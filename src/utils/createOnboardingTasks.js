import { fetchCreateTask } from './apiClient';
import debugConsole from './debugConsole';

const ONBOARDING_TASKS = [
  {
    title: 'Connect Google Calendar',
    description: 'Connecting your calendar will let you view your tasks and schedule side by side',
    effort: 0,
    impact: 4,
  },
  {
    title: 'Schedule recurring tasks',
    description: 'Get all of your daily or weekly tasks out of your head and into your Top 4',
    effort: 0,
    impact: 3,
  },
  {
    title: 'Block time for your first task',
    description:
      'After connecting your calendar, drag any task from your Top 4 into an open time slot to create a time block',
    effort: 0,
    impact: 2,
  },
  {
    title: 'Add Quatro as a bookmark on your desktop',
    description: '',
    effort: 0,
    impact: 1,
  },
  {
    title: 'Add Quatro to your phone’s home screen',
    description:
      'For some helpful Quatro content, like how to create a native mobile app experience, check out our FAQ at https://usequatro.com/faq',
    effort: 0,
    impact: 0,
  },
];

/**
 * @param {string} userId
 */
export default function createOnboardingTasks(userId) {
  debugConsole.log('Firestore', 'Creating onboarding tasks');
  ONBOARDING_TASKS.forEach((onboardingTask) => {
    fetchCreateTask(userId, onboardingTask);
  });
}

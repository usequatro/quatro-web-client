const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;
const gtag = (window as any).gtag || (() => { console.warn('GA not loaded'); });

export const trackRouteChange = (pathname: string) => {
  gtag('config', GA_MEASUREMENT_ID, { page_path: pathname });
};

export const trackUser = (userId: string) => {
  gtag('config', GA_MEASUREMENT_ID, { user_id: userId });
};

export const trackTaskCreated = (taskTitle: string) => {
  gtag('event', 'create_task', {
    event_category: 'tasks',
    event_label: taskTitle,
  });
};

export const taskTaskCompleted = (taskTitle: string) => {
  gtag('event', 'complete_task', {
    event_category: 'tasks',
    event_label: taskTitle,
  });
};

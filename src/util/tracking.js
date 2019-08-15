const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;
const gtag = window.gtag || (() => { console.warn('GA not loaded'); });

export const trackRouteChange = (pathname) => {
  gtag('config', GA_MEASUREMENT_ID, { page_path: pathname });
};

export const trackUser = (userId) => {
  gtag('config', GA_MEASUREMENT_ID, { user_id: userId });
};

export const trackTaskCreated = (taskTitle) => {
  gtag('event', 'create_task', {
    event_category: 'tasks',
    event_label: taskTitle,
  });
};

export const taskTaskCompleted = (taskTitle) => {
  gtag('event', 'complete_task', {
    event_category: 'tasks',
    event_label: taskTitle,
  });
};

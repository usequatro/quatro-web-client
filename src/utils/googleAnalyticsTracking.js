/**
 * Utils to send track events to Google Analytics
 */

const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;
const gtag =
  window.gtag ||
  (() => {
    console.warn('GA not loaded'); // eslint-disable-line no-console
  });

// eslint-disable-next-line import/prefer-default-export
export const trackRouteChange = (pathname) => {
  gtag('config', GA_MEASUREMENT_ID, { page_path: pathname });
};

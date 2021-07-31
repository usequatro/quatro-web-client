import React from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { isDesktopClient, openUrlInBrowserFromDesktopClient } from './applicationClient';
import debugConsole from './debugConsole';

/**
 * Expected to work with @material-ui/core/Link or @material-ui/core/Button
 *
 * @param {Object} Component
 * @returns
 */
export default function withSubdomainsAsDesktopExternalHref(Component) {
  const WrappedComponent = ({ onClick, href, ...props }) => {
    const { hostname } = useLocation();
    const handleClick = (event) => {
      if (onClick) {
        onClick(event);
      }
      if (!href) {
        return;
      }
      if (!isDesktopClient()) {
        debugConsole.log('link', 'skipping, not desktop client');
        return;
      }
      if (event.isDefaultPrevented()) {
        debugConsole.log('link', 'default was prevented');
        return;
      }
      if (!('URL' in window)) {
        debugConsole.log('link', 'window.URL not supported');
        return;
      }
      const hrefHostname = new URL(href);
      if (hrefHostname === hostname) {
        debugConsole.log('link', `Letting link ${href} execute normally`);
        return;
      }
      // If hostnames don't match, we always open in a new window.
      // We're basically overriding the configuration of Nativefier/ToDesktop that treats all
      // subdomains as internal URLs.
      debugConsole.log('link', `Forcing link ${href} to open outside desktop client app`);
      openUrlInBrowserFromDesktopClient(href);
      event.preventDefault();
    };
    return <Component {...props} href={href} onClick={handleClick} />;
  };

  WrappedComponent.propTypes = {
    href: PropTypes.string,
    onClick: PropTypes.func,
  };
  WrappedComponent.defaultProps = {
    href: undefined,
    onClick: undefined,
  };

  return WrappedComponent;
}

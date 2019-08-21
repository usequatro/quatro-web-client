import React from 'react';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import theme from '../constants/theme';

const Reset = createGlobalStyle`
    /* http://meyerweb.com/eric/tools/css/reset/
    v2.0 | 20110126
    License: none (public domain)
    */
    html, body, div, span, applet, object, iframe,
    h1, h2, h3, h4, h5, h6, p, blockquote, pre,
    a, abbr, acronym, address, big, cite, code,
    del, dfn, em, img, ins, kbd, q, s, samp,
    small, strike, strong, sub, sup, tt, var,
    b, u, i, center,
    dl, dt, dd, ol, ul, li,
    fieldset, form, label, legend,
    table, caption, tbody, tfoot, thead, tr, th, td,
    article, aside, canvas, details, embed,
    figure, figcaption, footer, header, hgroup,
    menu, nav, output, ruby, section, summary,
    time, mark, audio, video {
        margin: 0;
        padding: 0;
        border: 0;
        font-size: 100%;
        font: inherit;
        vertical-align: baseline;
    }
    /* HTML5 display-role reset for older browsers */
    article, aside, details, figcaption, figure,
    footer, header, hgroup, menu, nav, section {
        display: block;
    }
    body {
        line-height: 1;
    }
    ol, ul {
        list-style: none;
    }
    blockquote, q {
        quotes: none;
    }
    blockquote:before, blockquote:after,
    q:before, q:after {
        content: '';
        content: none;
    }
    table {
        border-collapse: collapse;
        border-spacing: 0;
    }
`;

const Defaults = createGlobalStyle`
  a { color: inherit; }
  body, html { font-size: 16px; }
  * { box-sizing: border-box; }
  body {
    font-family: ${(props) => props.theme.fonts.body};
    overflow: hidden; /* prevents pull outside the viewport */
  }
  svg {
    fill: currentColor; /* making SVG color be inherited */
  }
`;

const RootStyles = createGlobalStyle`
  #root { display: flex; justify-content: center }
`;

const AppStylesWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    <>
      <Reset />
      <Defaults />
      <RootStyles />
      {children}
    </>
  </ThemeProvider>
);

export default AppStylesWrapper;

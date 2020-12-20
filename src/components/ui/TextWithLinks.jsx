import React, { memo } from 'react';
import PropTypes from 'prop-types';
import truncate from 'lodash/truncate';
import Link from '@material-ui/core/Link';

const TextWithLinks = ({ text, maxLength }) => {
  const tmp = '|+|-|+|';
  const pieces = text.replace(/(https?:\/\/[^\s]+)/gi, `${tmp}$1${tmp}`).split(tmp);

  let remainingLength = maxLength;

  return pieces
    .map((piece, index) => {
      if (remainingLength <= 0) {
        return null;
      }
      const truncatedPiece = truncate(piece, { separator: ' ', length: remainingLength });
      remainingLength -= truncatedPiece.length;

      const isLink = index % 2 === 1;

      /* eslint-disable react/no-array-index-key */
      return isLink ? (
        <Link
          href={piece}
          key={index}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          {truncatedPiece}
        </Link>
      ) : (
        <React.Fragment key={index}>{truncatedPiece}</React.Fragment>
      );
      /* eslint-enable react/no-array-index-key */
    })
    .filter(Boolean);
};

TextWithLinks.propTypes = {
  text: PropTypes.string.isRequired,
  maxLength: PropTypes.number,
};

TextWithLinks.defaultProps = {
  maxLength: Infinity,
};

export default memo(TextWithLinks);

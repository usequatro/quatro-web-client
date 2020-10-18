import React, { useEffect, useRef, forwardRef } from 'react';
import PropTypes from 'prop-types';

import uploadUserFile from '../../utils/uploadUserFile';

export const ERROR_IMAGE_SIZE = 'Too large';

/**
 * Just a hidden input of type file with the added functionality of uploading asynchronously
 */
const AsyncFileUploadInput = forwardRef(
  ({ onStartUpload, onChangeComplete, onError, userId, maxSizeMB, ...props }, ref) => {
    // Track component unmounting to prevent delayed effects from running
    const active = useRef(true);
    useEffect(
      () => () => {
        active.current = false;
      },
      [],
    );

    const onImageChange = (event) => {
      if (event.target.files[0]) {
        if (event.target.files[0].size > maxSizeMB * 1024 * 1024) {
          onError({ code: ERROR_IMAGE_SIZE });
          return;
        }

        onStartUpload();
        uploadUserFile(event.target.files[0], userId)
          .then(({ url, name }) => {
            if (!active.current) {
              return;
            }
            onChangeComplete({ url, name });
          })
          .catch((error) => {
            if (!active.current) {
              return;
            }
            onError(error);
          });
      }
    };

    return (
      <input
        onChange={onImageChange}
        style={{ display: 'none' }}
        type="file"
        ref={ref}
        {...props}
      />
    );
  },
);

AsyncFileUploadInput.propTypes = {
  onChangeComplete: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onStartUpload: PropTypes.func,
  userId: PropTypes.string.isRequired,
  maxSizeMB: PropTypes.number.isRequired,
};

AsyncFileUploadInput.defaultProps = {
  onStartUpload: () => {},
};

export default AsyncFileUploadInput;

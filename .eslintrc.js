module.exports = {
  "env": {
    "browser": true,
    "es6": true,
  },
  "parserOptions": {
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true,
      "jsx": true,
    },
    "sourceType": "module",
  },
  "extends": [
    "eslint:recommended",
    "react-app",
    "airbnb"
  ],
  "rules": {
    "react/prop-types": "off",
    "jsx-a11y/label-has-associated-control": [ 2, {
    //   "labelComponents": ["CustomInputLabel"],
      "labelAttributes": ["label"],
      "controlComponents": ["BooleanCheckbox"],
      "depth": 3,
    }],
    "jsx-a11y/label-has-for": "off", // this rule was deprecated.
    "react/jsx-props-no-spreading": "off",
    "react/jsx-filename-extension": ["error", { "extensions": [".jsx",".tsx"] }],
    "max-len": "warn",
  }
};

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
    "extends": ["eslint:recommended", "react-app", "airbnb"],
    "rules": {
        "react/prop-types": "off"
    }
};

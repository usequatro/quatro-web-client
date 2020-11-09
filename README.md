# Quatro Frontend App

![CI](https://github.com/guillermodlpa/quatro-frontend/workflows/CI/badge.svg)

## Environments

1. **Dev**. Firebase project ID `quatro-dev-88030`
2. **Prod**. Firebase project ID `tasket-project`

Use Firebase's CLI to toggle between them with `firebase use`.

## Libraries

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app). All code can be found in [`src`](./src).

Libraries used:

- React.
- Redux: for global state management. (withredux-thunk)
- Material-UI: for UI components and styling.
- Firebase Firestore: for listening and persisting updates in realtime. [Watch this tutorial](https://firebase.google.com/docs/firestore/query-data/listen).
- React Router: for navigation.
- Date-fns: for date and time manipulation.

## Local development

1. Clone the repo
1. Clone the file `.env.development` into `.env.local` and adapt it as needed, e.g., remove the Mixpanel ID to disable tracking.
1. Run `npm install`
1. Run `npm run start`

Libraries for development

- ESLint. Recommended to use VSCode with ESLint's plugin.
- Prettier. Recommended to use VSCode with Prettier's plugin and enable _Editor: Format On Save_.

For linting and formatting, make sure you have ESLint and Prettier enabled on your code editor.

## Deployment

Continuous deployment is wired with GitHub Actions:

- Merging into the `develop` branch will trigger a deploy to https://dev.usequatro.com with `.env.development` variables.
- Merging into the `master` branch will trigger a deploy to https://app.usequatro.com with `.env` variables.

For more details, see the [deployment config](.github/workflows/deploy_to_firebase_hosting.yml).

There's a slack integration configured (see [notifyDeploy.sh](./script/notifyDeploy.sh)) to notify the Quatro #deploys channel in Slack.

### Manual deployment

First, make sure you have an `.env` file. This file contains production environment variables. Ask another contributor for a copy.

```
npm run build-and-deploy
```

## Project documnetation

The easiest way to see the data structures is by opening the Redux Dev Tools while using the app.

In Firebase, we keep tasks represented with 2 entities: `tasks` and `recurringConfigs`. The best way to see this structures is to open [Firestore's console](https://console.firebase.google.com/project/tasket-project/database).

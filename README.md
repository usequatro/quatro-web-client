# Quatro Frontend App

![CI](https://github.com/guillermodlpa/quatro-frontend/workflows/CI/badge.svg)

## Environments

1. **Dev**. Firebase project ID `quatro-dev-88030`
2. **Prod**. Firebase project ID `tasket-project`

Use Firebase's CLI to toggle between them with `firebase use`.

## Local set up

1. Clone the repo
2. Run `npm install`.
3. Run `npm run start`.

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

## Implementation details

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app). All code can be found in [`src`](./src).

### Libraries the code uses

- React.
- Redux: for global state management. (redux-thunk)
- Material-UI: for UI components and styling.
- Redux Saga: for side effects, like triggering autosave.
- React Router: for navigation.
- Date-fns: for date and time manipulation.

### Data structures

The easiest way to see the data structures is by opening the Redux Dev Tools while using the app.

In Firebase, we keep tasks represented with 2 entities: `tasks` and `recurringConfigs`. The best way to see this structures is to open [Firestore's console](https://console.firebase.google.com/project/tasket-project/database).

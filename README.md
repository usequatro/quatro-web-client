# Quatro Web Client App

![CI](https://github.com/usequatro/quatro-web-client/workflows/CI/badge.svg)

## Environments

### Dev (Default)

* [https://dev.usequatro.com](https://dev.usequatro.com)
* [Firebase project: quatro-dev-88030](https://console.firebase.google.com/u/0/project/quatro-dev-88030/overview)
* [Google API Dashboard: quatro-dev-88030](https://console.developers.google.com/apis/dashboard?project=quatro-dev-88030)

### Prod

* [https://app.usequatro.com](https://app.usequatro.com)
* [Firebase project: tasket-project](https://console.firebase.google.com/u/0/project/tasket-project/overview)
* [Google API Dashboard: tasket-project](https://console.developers.google.com/apis/dashboard?project=tasket-project)

## Libraries

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app). All code can be found in [`src`](./src).

Libraries used:

* React.
* Redux for global state management (imeplement with [Redux Toolkit](https://redux-toolkit.js.org/))
* [Material-UI](https://material-ui.com/) for UI components and styling.
* Firebase Firestore for listening and persisting updates in realtime. [Watch this tutorial](https://firebase.google.com/docs/firestore/query-data/listen).
* [React Router](https://reactrouter.com/) for navigation.
* [Date-fns](https://date-fns.org/) for date and time manipulation.

## Local development

1. Clone the repo.
1. Clone the file `.env.development` into `.env.local` and adapt it as needed, e.g., remove the Mixpanel ID to disable tracking.
1. Run `npm install`
1. Run `npm run start`. For HTTPS run `HTTPS=true npm run start`

Libraries for development:

- ESLint. Recommended to use VSCode with ESLint's plugin.
- Prettier. Recommended to use VSCode with Prettier's plugin and enable _Editor: Format On Save_.

For linting and formatting, make sure you have ESLint and Prettier enabled on your code editor.

For Firebase, use its CLI to toggle between them with `firebase use [env]`. Check active environment with `firebase use`.

## Deployment

Continuous deployment is wired with GitHub Actions:

- Merging into `main` or `release/*` branches will trigger a deploy to https://dev.usequatro.com with `.env.development` variables.
- Tagging with `vX.X.X` will trigger a deploy to https://app.usequatro.com with `.env` variables.

For more details, see the [workflows folder](.github/workflows).

There's a slack integration configured (see [notifyDeploy.sh](./script/notifyDeploy.sh)) to notify the Quatro #deploys channel in Slack.

### Manual deployment

First, make sure you have an `.env` file. This file contains production environment variables. Ask another contributor for a copy.

```sh
npm run build-and-deploy
```

## Project documentation

The high level technical documentation is hosted outside this repository, as it includes information related to other repositories and integrations.

[Quatro Technical Documentation](https://docs.google.com/document/d/1z9uK2gFBZeuiMLmsh08kf9RSmdj7RKzR1OC20U-m_cI/edit?usp=sharing)

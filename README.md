# Quatro Web Client App

![CI badge](https://github.com/usequatro/quatro-web-client/workflows/CI/badge.svg)
![Dev CI badge](https://github.com/usequatro/quatro-web-client/workflows/Dev%20Continuous%20Deployment/badge.svg)
![Production Deployment badge](https://github.com/usequatro/quatro-web-client/workflows/Production%20Deployment/badge.svg)

https://app.usequatro.com

📄 General technical documentation: https://github.com/usequatro/quatro-docs

## Project status

[![Project Status: Inactive – The project has reached a stable, usable state but is no longer being actively developed; support/maintenance will be provided as time allows.](https://www.repostatus.org/badges/latest/inactive.svg)](https://www.repostatus.org/#inactive)

In 2022, Quatro's team decided to stop the project. Check out this blog post to learn more: [What a B2B PM Learned About Building Consumer Products.](https://jonsaft.com/2022/02/04/what-a-b2b-pm-learned-about-building-consumer-products/)

If you have a technical question or want to contribute, feel free to [open an issue.](https://github.com/usequatro/quatro-web-client/issues/new)

## Technologies

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app). All code can be found in [`/src`](./src).

Libraries used:

- React.
- Redux for global state management (imeplement with [Redux Toolkit](https://redux-toolkit.js.org/))
- [Material-UI](https://material-ui.com/) for UI components and styling.
- Firebase Firestore for listening and persisting updates in realtime. [Watch this tutorial](https://firebase.google.com/docs/firestore/query-data/listen).
- [React Router](https://reactrouter.com/) for navigation.
- [Date-fns](https://date-fns.org/) for date and time manipulation.

Integrations of the frontend:

- Google Calendar API

## Local development

1. Clone the repo.
1. Clone the file `.env.development` into `.env.local` and adapt it as needed, e.g., remove the Mixpanel ID to disable tracking.
1. Run `npm install`
1. Run `npm run start`. For HTTPS run `HTTPS=true npm run start`

For linting and formatting, make sure you have ESLint and Prettier enabled on your code editor.

To work with your Firebase instance, use its CLI to toggle between them with `firebase use [env]`. Check active environment with `firebase use`.

## Deployment (Only core contributors)

Continuous deployment is wired with GitHub Actions:

- Merging into `main` or `release/*` branches will trigger a deploy to https://dev.usequatro.com with `.env.development` variables.
- Tagging with `vX.X.X` will trigger a deploy to https://app.usequatro.com with `.env` variables. Use GitHub Releases to produce the tag and release documentation.

For more details, see the [workflows folder](.github/workflows).

The `FIREBASE_TOKEN` is a refresh token generated with the Firebase CLI, via `firebase login:ci`, and stored as a GitHub secret to Actions can use it. Renewing it will be necessary sometimes.

There's a slack integration configured (see [notifyDeploy.sh](./script/notifyDeploy.sh)) to notify the Quatro #deploys channel in Slack.

### Releases

We use GitHub Releases to document release notes, as well as triggering a new version deployment.

1. Go to the GitHub Releases page.
2. Click "Draft a new release".
3. Set a tag version 1 number above the last tag. Use patch increases for bug fixes and improvements, and minor increases for new features. Major increases are only for visually major changes that mean "a new Quatro".
4. Summarize the changes in the Release title
5. Add bullet points for all changes in the release and links to their pull requests in the description. [Example](https://github.com/usequatro/quatro-web-client/releases/edit/v1.17.0).

### Manual deployment

First, make sure you have an `.env` file. This file contains production environment variables. Ask another contributor for a copy.

```sh
npm run build-and-deploy
```

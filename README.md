# Quatro Frontend App

## Local set up

1. Clone the repo
2. Run `npm install`.
3. Run `npm run start`.

## Implementation details

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app). All code can be found in [`src`](./src).

### Libraries the code uses
* React
* Redux
* TypeScript (not everywhere though)
* Styled Components
* Rebass: basic UI library that can be extended
* React Router

### Data structures

The easiest way to see the data structures is by opening the Redux Dev Tools while using the app.

In Firebase, we keep tasks represented with 2 entities: `tasks` and `recurringConfigs`. The best way to see this structures is to open [Firestore's console](https://console.firebase.google.com/project/tasket-project/database).

In the Frontend, we break them down into 3 entities: `tasks`, `taskDependencies` and `recurringConfigs` since it's easier to manipulate this way.

## Things to keep in mind

1. Before deploying changes, test on mobile, with the app saved as full screen web app in the homepage.

## How to deploy changes

First, make sure you have an `.env` file. This file contains production environment variables. Ask another contributor for a copy.

1. Run `npm run build-and-deploy`.

There's a slack integration configured (see [messageSlack.sh](./messageSlack.sh)) so the Quatro worksplace #deploys channel will be notified.

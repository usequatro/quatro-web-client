#!/bin/bash

FIREBASE_ACTIVE_PROJECT=$(firebase use);

Color_Off='\033[0m'
BGreen='\033[1;32m'
BYellow='\033[1;33m'
BRed='\033[1;31m'


if [[ "$FIREBASE_ACTIVE_PROJECT" == "quatro-dev-88030" ]]; then
    printf "Building for Firebase project ${BGreen}$FIREBASE_ACTIVE_PROJECT${Color_Off}\n";
    npm run build-dev
elif [[ "$FIREBASE_ACTIVE_PROJECT" == "tasket-project" ]]; then
    printf "Building for Firebase project ${BYellow}$FIREBASE_ACTIVE_PROJECT${Color_Off}\n";
    npm run build-prod
else
    printf "Unknown Firebase project ${BRed}$FIREBASE_ACTIVE_PROJECT${Color_Off}\n";
    exit 1;
fi

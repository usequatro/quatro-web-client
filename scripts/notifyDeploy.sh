#!/bin/bash

# Notifies that the deploy has completed

FIREBASE_ACTIVE_PROJECT=$(firebase use);

if [[ "$FIREBASE_ACTIVE_PROJECT" == "quatro-dev-88030" ]]; then
    ./scripts/messageSlack.sh "Deployer" "Application deployed - DEVELOPMENT - https://dev.usequatro.com 🛶"
elif [[ "$FIREBASE_ACTIVE_PROJECT" == "tasket-project" ]]; then
    ./scripts/messageSlack.sh "Deployer" "Application deployed - PRODUCTION - https://app.usequatro.com 🚀"
else
    printf "Unknown Firebase project ${BRed}$FIREBASE_ACTIVE_PROJECT${Color_Off}\n";
    exit 1;
fi

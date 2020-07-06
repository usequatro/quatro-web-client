#!/bin/bash

# Notifies that the deploy has completed

if [[ "$GCLOUD_PROJECT" == "quatro-dev-88030" ]]; then
    ./scripts/messageSlack.sh "Deployer" "Application deployed - DEVELOPMENT - https://dev.usequatro.com 🛶"
elif [[ "$GCLOUD_PROJECT" == "tasket-project" ]]; then
    ./scripts/messageSlack.sh "Deployer" "Application deployed - PRODUCTION - https://app.usequatro.com 🚀"
else
    printf "Unknown Firebase project ${BRed}$GCLOUD_PROJECT${Color_Off}\n";
    exit 1;
fi

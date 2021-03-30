#!/bin/bash

# Notifies that the deploy has completed

if [[ "$GCLOUD_PROJECT" == "quatro-dev-88030" ]]; then
    LATEST_COMMIT=$(git log --pretty=format:"%h - %an, %ar: \\\"%s\\\"" -1);
    ./scripts/messageSlack.sh ":canoe:" "Deployed to DEVELOPMENT - https://dev.usequatro.com - ${LATEST_COMMIT}"
elif [[ "$GCLOUD_PROJECT" == "tasket-project" ]]; then
    LATEST_COMMIT=$(git log --pretty=format:"%h - %an, %ar: \\\"%s\\\"" -1);
    LATEST_TAG=$(git describe --abbrev=0 --tags);
    ./scripts/messageSlack.sh ":rocket:" "Deployed to PRODUCTION - https://app.usequatro.com - ${LATEST_COMMIT} - Tag: ${LATEST_TAG}"
else
    printf "Unknown Firebase project ${BRed}$GCLOUD_PROJECT${Color_Off}\n";
    exit 1;
fi

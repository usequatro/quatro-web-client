#!/bin/bash

# Triggers a slack message

curl -X POST -H 'Content-type: application/json' --data "{\"text\":\"$3\",\"username\":\"$1\",\"icon_emoji\":\"$2\"}" https://hooks.slack.com/services/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

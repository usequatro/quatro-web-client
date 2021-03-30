#!/bin/bash

# Triggers a slack message

curl -X POST -H 'Content-type: application/json' --data "{\"text\":\"$2\",\"username\":\"Quatro Web Application\",\"icon_emoji\":\"$1\"}" https://hooks.slack.com/services/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

#!/bin/bash

if [ -f .env ]; then
    source .env
else
    echo ".env file not found. Please ensure it exists with the MODEL_URL variable."
    exit 1
fi

if [ -z "$MODEL_URL" ]; then
    echo "MODEL_URL is not set in the .env file."
    exit 1
fi

URL=$MODEL_URL
FILENAME=$(basename "$URL")
curl -L "$URL" -o "./models/$FILENAME"

if [ $? -eq 0 ]; then
    echo "Download successful. File saved as ./models/$FILENAME"
else
    echo "Download failed."
    exit 1
fi
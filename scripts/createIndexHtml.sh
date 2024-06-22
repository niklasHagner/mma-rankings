#!/bin/bash

# Define necessary variables
URL="http://example.com"
OUTPUT_FILE="../data/index.html"

curlAttemptCount=0

echo "Curling: $URL."

# Function to curl and check the HTTP status code
fetch_content() {
    # Increment the counter
    curlAttemptCount=$((curlAttemptCount + 1))

    HTTP_STATUS=$(curl -o "$OUTPUT_FILE" -s -w "%{http_code}" "$URL")

    if [ "$HTTP_STATUS" -eq 200 ]; then
        echo "Successfully saved data/index.html"
    else
        echo "Failed with status code: $HTTP_STATUS."
        
        # Try again after 1 minute, up to 3 times
        if [ $curlAttemptCount -le 3 ]; then
            echo "Retrying in 1 minute..."
            sleep 60
            fetch_content
        else
            echo "Failed to fetch content after 3 attempts."
            return 1 # Use return instead of exit to allow for future script extension
        fi
    fi
}

fetch_content || echo "Fetching content failed."
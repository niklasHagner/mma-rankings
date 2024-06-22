# curls https://ufc.onrender.com/ and saves index.html to data-folder IF it returns 200. Otherwise try again in 1 minuteBelow is a Bash script that curls https://ufc.onrender.com/, checks if the response code is 200, and saves the output to index.html in a directory named `data-folder`. If the response code is not 200, the script will retry every minute.
#!/bin/bash

# Define the URL, output directory, and file
URL="https://ufc.onrender.com/"
OUTPUT_FILE="..data/index.html"

curlAttemptCount=0

# Function to curl and check the HTTP status code
fetch_content() {
    # Increment the counter
    curlAttemptCount=$((curlAttemptCount + 1))

    HTTP_STATUS=$(curl -o "$OUTPUT_FILE" -s -w "%{http_code}" "$URL")

    if [ "$HTTP_STATUS" -eq 200 ]; then
        echo "Successfully saved index.html to ${OUTPUT_DIR}"
        exit 0
    else
        echo "Failed with status code: $HTTP_STATUS."
        
        # Try again after 1 minute...at least once
        if [[ $curlAttemptCount -le 3 ]]; then
            echo "Retrying in 1 minute..."
            sleep 60
            fetch_content
        fi
    

    fi
}

fetch_content
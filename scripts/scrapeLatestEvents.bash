
#!/bin/bash

urlWithPastEvents="https://en.wikipedia.org/wiki/List_of_UFC_events"
html=$(curl -s "$urlWithPastEvents")

# Select table with id="Past_events"
table=$(echo "$html" | awk '/<table[^>]*id="Past_events"/,/<\/table>/')

# We don't need anything older than 2024-01-13
compDate=$(date -j -f "%Y-%m-%d" "2024-01-13" "+%Y%m%d")

# Array to hold the output URLs
declare -a urlArray

# Counter variable for loop iterations
counter=0

# Parse the HTML to extract urls
echo "$html" | awk '/<table[^>]*id="Past_events"/,/<\/table>/' | grep '<tr' | while IFS= read -r row; do

    # Increment the counter
    ((counter++))

    # Extract the date from the row and format it for comparison
    date=$(echo "$row" | sed -n 's/.*<td.*data-sort-value="\([^"]*\)".*/\1/p' | sed 's/-//g' | head -1)
    
    # Echo the entire row only on the second loop iteration
    if [[ $counter -eq 2 ]]; then
        echo "$row"
    fi
    
    # Check if the date is greater than the comparison date
    if [[ "$date" > "$compDate" ]]; then
        # Extract the URL
        url=$(echo "$row" | sed -n 's/.*<a href="\([^"]*\)".*/\1/p' | head -1)
        
        # Check if URL is not empty
        if [[ -n "$url" ]]; then
            # Prepend domain if needed and add to array
            urlArray+=("https://en.wikipedia.org$url")
            
            # Print debug info
            # echo "Date: $date, URL: https://en.wikipedia.org$url"
        fi
    fi
done

# -- SAVE FILE --
# # Format the datetime as 'YYYYMMDD-HHMMSS'
# datetime=$(date "+%Y%m%d-%H%M%S")

# # Define the filename with the current datetime
# filename="x-${datetime}.txt"

# # Iterate over urlArray and append each URL to the file
# for url in "${urlArray[@]}"; do
#     echo "$url" >> "$filename"
# done

# echo "URLs saved to $filename"


# urlArray=(
#     "https://en.wikipedia.org/wiki/UFC_Fight_Night:_Ankalaev_vs._Walker_2"
#     "https://en.wikipedia.org/wiki/UFC_296"
# )

# for url in "${urlArray[@]}"; do
#     curl -A 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' "$url" -o "$(basename "$url").html"
# done
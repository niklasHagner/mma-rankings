import requests
import os
import json
from bs4 import BeautifulSoup
from datetime import datetime, timedelta

# Fetch the HTML content
url = "https://en.wikipedia.org/wiki/List_of_UFC_events"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
}
response = requests.get(url, headers=headers)
html_content = response.text

print("First 100 chars of HTML content:")
print(html_content[:100])

# Parse the HTML
soup = BeautifulSoup(html_content, 'html.parser')

def past_events_to_file():
    print("\nPast events")
    rows = soup.select("#Past_events tr")

    # Comparison date
    today = datetime.now()
    past_date = today - timedelta(days=50)

    # Filter rows based on conditions
    good_rows = []
    for row in rows:
        cells = row.find_all("td")

        if not cells or len(cells) < 3:
            continue
        
        link_element = cells[1].find("a")
        link = link_element['href'] if link_element else None
        link_text = link_element.text.strip() if link_element else None  # innerText which is like "UFC 123: x vs y


        date_str = cells[2].text.strip()
        try:
            date = datetime.strptime(date_str, "%b %d, %Y")  # Expect formats like "Sep 20, 2023"
        except ValueError:
            continue

        is_date_good = date > past_date
        
        if is_date_good and link:
            print(date, link)
            good_rows.append(row)


    data_to_save = []  # Holds json array with {date, eventName, url}

    for row in good_rows:
        cells = row.find_all("td")
        link_element = cells[1].find("a")
        link = link_element['href'] if link_element else None
        link_text = link_element.text.strip() if link_element else None  # innerText which is like "UFC 123: x vs y"
        date_str = cells[2].text.strip()

        # Only add data if link is present
        if link:
            data_to_save.append({
                "date": date_str,
                "eventName": link_text,
                "url": link
            })

    # Serialize the list of dictionaries to a JSON string
    json_data = json.dumps(data_to_save, indent=4)
    print(json_data)  # Print JSON data for past events

    file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'pastEventsPythonScraped.json'))

    try:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(json_data)
        print(f"Successfully wrote to {file_path}")
    except Exception as e:
        print(f"Failed to write to {file_path}: {e}")



def future_events_to_file():
    print("\n\nFuture events")
    rows = soup.select("#Scheduled_events tr")


    # Filter rows based on conditions
    good_rows = []
    for row in rows:
        cells = row.find_all("td")

        if not cells or len(cells) < 3:
            continue
        
        link_element = cells[0].find("a")
        link = link_element['href'] if link_element else None

        if link:
            print(link)
            good_rows.append(row)

    data_to_save = []  # Holds json array with {date, eventName, url}

    for row in good_rows:
        cells = row.find_all("td")
        link_element = cells[0].find("a")
        link = link_element['href'] if link_element else None
        link_text = link_element.text.strip() if link_element else None  # innerText which is like "UFC 123: x vs y"
        date_str = cells[1].text.strip()

        # Only add data if link is present
        if link:
            data_to_save.append({
                "date": date_str,
                "eventName": link_text,
                "url": link
            })

    # Serialize the list of dictionaries to a JSON string
    json_data = json.dumps(data_to_save, indent=4)
    print(json_data)  # Print JSON data for future events
    

    # Write the JSON string to a file
    file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'futureEventsPythonScraped.json'))
    try:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(json_data)
        print(f"Successfully wrote to {file_path}")
    except Exception as e:
        print(f"Failed to write to {file_path}: {e}")


past_events_to_file()
future_events_to_file()
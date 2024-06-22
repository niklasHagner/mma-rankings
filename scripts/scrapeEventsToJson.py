import requests
import json
from bs4 import BeautifulSoup
from datetime import datetime

# Fetch the HTML content
url = "https://en.wikipedia.org/wiki/List_of_UFC_events"
response = requests.get(url)
html_content = response.text

# with open('a.html', 'r', encoding='utf-8') as file:
#     html_content = file.read()


# Parse the HTML
soup = BeautifulSoup(html_content, 'html.parser')

def past_events_to_file():
    print("Past events")
    rows = soup.select("#Past_events tr")

    # Comparison date
    comp_date = datetime.strptime("2024-06-21", "%Y-%m-%d")

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

        is_date_good = date > comp_date
        
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

    # Write the JSON string to a file
    with open('../data/pastEventsPythonScraped.json', 'w', encoding='utf-8') as file:
        file.write(json_data)



def future_events_to_file():
    print("Future events")
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

    # Write the JSON string to a file
    with open('../data/futureEventsPythonScraped.json', 'w', encoding='utf-8') as file:
        file.write(json_data)


past_events_to_file()
future_events_to_file()
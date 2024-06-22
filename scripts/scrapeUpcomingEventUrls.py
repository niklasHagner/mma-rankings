import requests
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

# Find rows in the "Past_events" table
rows = soup.select("#Past_events tr")

# Comparison date
comp_date = datetime.strptime("2024-01-13", "%Y-%m-%d")

# Filter rows based on conditions
good_rows = []
for row in rows:
    cells = row.find_all("td")

    if not cells or len(cells) < 3:
        continue
    
    link_element = cells[1].find("a")
    link = link_element['href'] if link_element else None

    date_str = cells[2].text.strip()
    try:
        date = datetime.strptime(date_str, "%b %d, %Y")  # Expect formats like "Sep 20, 2023"
    except ValueError:
        continue

    is_date_good = date > comp_date
    
    if is_date_good and link:
        print(date, link)
        good_rows.append(row)

# Extract URLs from good rows
urls = [row.find_all("td")[1].find("a")['href'] for row in good_rows if row.find_all("td")[1].find("a")]

# Save to file named 'urls.txt'
with open('urls.txt', 'w', encoding='utf-8') as file:
    for url in urls:
        file.write(url + '\n')  # Write each URL to the file, followed by a newline character


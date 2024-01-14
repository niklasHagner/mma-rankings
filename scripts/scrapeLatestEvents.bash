
#!/bin/bash

urls=(
    "https://en.wikipedia.org/wiki/UFC_Fight_Night:_Ankalaev_vs._Walker_2"
    "https://en.wikipedia.org/wiki/UFC_296"
    "https://en.wikipedia.org/wiki/UFC_Fight_Night:_Song_vs._Guti%C3%A9rrez"
    "https://en.wikipedia.org/wiki/UFC_on_ESPN:_Dariush_vs._Tsarukyan"
    "https://en.wikipedia.org/wiki/UFC_Fight_Night:_Allen_vs._Craig"
    "https://en.wikipedia.org/wiki/UFC_295"
    "https://en.wikipedia.org/wiki/UFC_Fight_Night:_Almeida_vs._Lewis"
    "https://en.wikipedia.org/wiki/UFC_294"
    "https://en.wikipedia.org/wiki/UFC_Fight_Night:_Yusuff_vs._Barboza"
    "https://en.wikipedia.org/wiki/UFC_Fight_Night:_Dawson_vs._Green"
    "https://en.wikipedia.org/wiki/UFC_Fight_Night:_Fiziev_vs._Gamrot"
    "https://en.wikipedia.org/wiki/UFC_Fight_Night:_Grasso_vs._Shevchenko_2"
    "https://en.wikipedia.org/wiki/UFC_293"
    "https://en.wikipedia.org/wiki/UFC_Fight_Night:_Gane_vs._Spivak"
    "https://en.wikipedia.org/wiki/UFC_Fight_Night:_Holloway_vs._The_Korean_Zombie"
    "https://en.wikipedia.org/wiki/UFC_292"
    "https://en.wikipedia.org/wiki/UFC_on_ESPN:_Luque_vs._dos_Anjos"
    "https://en.wikipedia.org/wiki/UFC_on_ESPN:_Sandhagen_vs._Font"
    "https://en.wikipedia.org/wiki/UFC_291"
    "https://en.wikipedia.org/wiki/UFC_Fight_Night:_Aspinall_vs._Tybura"
)

for url in "${urls[@]}"; do
    curl -A 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' "$url" -o "$(basename "$url").html"
done
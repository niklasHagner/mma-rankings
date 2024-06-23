const Fuse = require('fuse.js');

// Fuse.js expects array
// Initialize Fuse.js with the array and options
const options = {
  // Specify the keys to search in
  keys: ['fighterAnsiName', 'wikipediaNameWithDiacritics', 'alternativeName', 'mmaStatsName'],
  includeScore: true,
  threshold: 0.3, // Lower means more strict
};

// Returns part of allFighters.json
function search(req, res, next) {
  const fuse = new Fuse(global.fightersWithProfileLinks, options);
  const { query } = req.query;
  if (!query) {
    return res.status(400).send('Query parameter is required');
  }

  let fuseHits = fuse.search(query);
  const htmlStrings = fuseHits.map((fuseHit) => {
    const fighterObject = fuseHit?.item;
    const fighterLink = fighterObject?.fileName ? `/fighter/${fighterObject.fileName.replace(".json", "")}` : null;
    const html = fighterLink ? `<a href="${fighterLink}" class="name">${fighterObject.fighterAnsiName}</a>` : `<span class="name">${fighterObject.fighterAnsiName}</span>`;

    console.log(fuseHit.score, fighterObject.fighterAnsiName);
    return html;  
  });
  
  return res.status(200).send(htmlStrings.join(" "));
}

module.exports = {
  search
}


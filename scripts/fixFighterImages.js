const fs = require('fs');

const fileHelper = require('../backend/fileHelper.js');
const viewBuilder = require('../backend/viewBuilder.js');
const { findImagesForFighter } = require('../backend/wikipediaApi.js');

global.fightersWithProfileLinks = JSON.parse(fs.readFileSync("data/allFighters.json"));
global.rankData = JSON.parse(fs.readFileSync("data/mmaStats.json"));

async function fixFighterData() {
  const fighters = await fileHelper.getAllFightersFromFiles();
  const fightersWithoutImages = fighters
    .filter(x => ! x.fighterInfo?.relevantImages)
    .slice(0, 10);

  console.log("fetching images for", fightersWithoutImages.map(x => x.fighterInfo.name));

  for (const fighter of fightersWithoutImages) {
    const imageArray = await findImagesForFighter(fighter.fighterInfo["name"]);
    fighter.fighterInfo.relevantImages = imageArray.slice(0, 10);
    fileHelper.saveFighter(fighter);
  };
  return;
}

fixFighterData();
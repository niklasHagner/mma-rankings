const fs = require('fs');

const fileHelper = require('../backend/fileHelper.js');
const viewBuilder = require('../backend/viewBuilder.js');

global.fightersWithProfileLinks = JSON.parse(fs.readFileSync("data/allFighters.json"));
global.rankData = JSON.parse(fs.readFileSync("data/mmaStats.json"));

async function fixFighterData() {
  const fighterBasicData = await fileHelper.getAllFightersFromFiles();
  const fighters = await Promise.all(fighterBasicData.map(fighter => viewBuilder.extendFighterApiDataWithRecordInfo(fighter, global.rankData)));
  fighters.forEach(fighter => {
    let likelyModified = false;
    fighter.record.forEach(fight => {
      const hasOpponentRankDate = fight.opponentInfoAtTheTime?.date;
      if (hasOpponentRankDate) {
        const opponentRankDate = new Date(fight.opponentInfoAtTheTime?.date);
        const fightDate = new Date(fight.date);
        const monthDiff = (fightDate.getFullYear()*12 + fightDate.getMonth()) - (opponentRankDate.getFullYear()*12 + opponentRankDate.getMonth() )
        if (monthDiff <= -12) {
          fight.opponentInfoAtTheTime.wasInThePast = true;
        } else if (monthDiff >= 12 )  {
          fight.opponentInfoAtTheTime.wasInTheFuture = true;
        } else {
          fight.opponentInfoAtTheTime.wasInThePast = false;
          fight.opponentInfoAtTheTime.wasInTheFuture = false;
        }
        likelyModified = true;
      }
    });
    if (likelyModified) {
      fileHelper.saveFighter(fighter);
    }
  });
  return;
}

fixFighterData();
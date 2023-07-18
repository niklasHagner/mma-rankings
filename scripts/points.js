const fs = require('fs');

const fileHelper = require('../backend/fileHelper.js');
const viewBuilder = require('../backend/viewBuilder.js');

global.fightersWithProfileLinks = JSON.parse(fs.readFileSync("data/allFighters.json"));
global.rankData = JSON.parse(fs.readFileSync("data/mmaStats.json"));

const pointsPerRank = {
  "C":16,
  "1":15,
  "2":14,
  "3":13,
  "4":12,
  "5":11,
  "6":10,
  "7":9,
  "8":8,
  "9":7,
  "10":6,
  "11":5,
  "12":4,
  "13":3,
  "14":2,
  "15":1,
}

async function generatePoints() {
  const fighterBasicData = await fileHelper.getAllFightersFromFiles();
  const fighters = await Promise.all(fighterBasicData.map(fighter => viewBuilder.extendFighterApiDataWithRecordInfo(fighter, global.rankData)));
  const allResultObjs = [];
  fighters.forEach(fighter => {
    const resultObj = { name: fighter.fighterInfo.name, draws:[], wins: [], losses: [], points: { wins: 0, losses:0, draws: 0}, fightsSince2019: 0 }
    
    fighter.record.forEach(fight => {
      const opponentRank = !fight.opponentInfoAtTheTime?.wasInTheFuture && !fight.opponentInfoAtTheTime?.wasInThePast ? fight.opponentInfoAtTheTime?.fighter?.rank : null;
      const points = pointsPerRank[opponentRank] || 0;
      if (fight.result === "Win") {
        resultObj.wins.push(points);
      } else if (fight.result === "Loss") {
        resultObj.losses.push(points);
      } else if (fight.result === "Draw") {
        resultObj.draws.push(points);
      }


        //Fights since 2019
        if (Number(fight.year) > 2018 ) {
            resultObj.fightsSince2019++;
        }
    });
    resultObj.points.wins = resultObj.wins.length < 1 ? 0 : resultObj.wins.reduce((total,curr) => total+curr);
    resultObj.points.losses = resultObj.losses.length < 1 ? 0 : resultObj.losses.reduce((total,curr) => total+curr);
    resultObj.points.draws = resultObj.draws.length < 1 ? 0 : resultObj.draws.reduce((total,curr) => total+curr);
    allResultObjs.push(resultObj);
  });
  allResultObjs.sort((a,b) => {
    return b.points.wins - a.points.wins;
  });
  const pointPerName = allResultObjs.map(x => `${x.name}: ${x.points.wins}`);
  fs.writeFileSync("data/points.txt", pointPerName.join("\n"));
  fs.writeFileSync("data/points.json", JSON.stringify(allResultObjs));

  const fightsSince2019PerName = allResultObjs.sort((a,b) => b.fightsSince2019 - a.fightsSince2019).map(x => `${x.name}: ${x.fightsSince2019}`);
  fs.writeFileSync("data/fightsSince2019.txt", fightsSince2019PerName.join("\n"));

  return;
}

generatePoints();
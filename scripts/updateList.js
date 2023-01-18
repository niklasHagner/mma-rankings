const fs = require('fs');
const fileHelper = require('../backend/fileHelper.js');

global.rankData = JSON.parse(fs.readFileSync("data/mmaStats.json"));

async function updateList() {
  console.log("updateList");
  fileHelper.updateListOfFighterFiles();
  console.log("done");
  return;
}

updateList();
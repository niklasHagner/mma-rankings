const fs = require('fs');
const fileHelper = require('../backend/fileHelper.js');

global.rankData = JSON.parse(fs.readFileSync("data/mmaStats.json"));

//Syncs allFighters.json with the list of files in the data/fighters folder
async function updateList() {
  console.log("updateList");
  fileHelper.updateListOfFighterFiles();
  console.log("done");
  return;
}

updateList();
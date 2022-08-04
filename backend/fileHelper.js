const fs = require("fs");

function readFileByShortFileName(shortFileName) {
  const fileName = "data/fighters/" + shortFileName + ".json"
  const fileExists = fs.existsSync(fileName);
  if (!fileExists) {
    return null;
  }
  let rawdata = fs.readFileSync(fileName);
  let data = JSON.parse(rawdata);
  return data;
}

function readFileByFighterObj(fighter) {
  const fileName = getFileNameByFighterObj(fighter);
  const fileExists = fs.existsSync(fileName);
  if (!fileExists) {
    return null;
  }
  let rawdata = fs.readFileSync(fileName);
  let data = JSON.parse(rawdata);
  return data;
}

function getFileNameByFighterObj(fighter) {
  const url = fighter.url || fighter.fighterInfo.wikiUrl;
  const split = url.split("/");
  const slug = split[split.length-1];
  const fileName = "data/fighters/" + slug + ".json";
  return fileName;
}

async function saveFighter(fighter) {
  const fileName = getFileNameByFighterObj(fighter);
  try {
    const exists = await fs.promises.stat(fileName);
    // if (exists) {
    //   const data = await fs.promises.readFile(fileName);
    //   const parsed = JSON.parse(data);
    // }
  } catch(err) {
    await fs.promises.writeFile(fileName, JSON.stringify(fighter));
  }
}

module.exports = {
  readFileByFighterObj,
  readFileByShortFileName,
  saveFighter,
}
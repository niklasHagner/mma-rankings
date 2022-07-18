const fs = require("fs");

function getFileName(fighter) {
  const url = fighter.url || fighter.fighterInfo.wikiUrl;
  const split = url.split("/");
  const slug = split[split.length-1];
  const fileName = "data/fighters/" + slug + ".json";
  return fileName;
}

function readFighter(fighter) {
  const fileName = getFileName(fighter);
  const fileExists = fs.existsSync(fileName);
  if (!fileExists) {
    return null;
  }
  let rawdata = fs.readFileSync(fileName);
  let data = JSON.parse(rawdata);
  return data;
}

async function saveFighter(fighter) {
  const fileName = getFileName(fighter);
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
  readFighter,
  saveFighter
}
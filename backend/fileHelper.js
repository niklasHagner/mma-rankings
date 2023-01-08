const fs = require("fs");
const { removeDiacritics } = require('./stringAndHtmlHelper.js');

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
  const slug = split[split.length - 1];
  const fileName = "data/fighters/" + slug + ".json";
  return fileName;
}

async function saveFighter(fighter) {
  const fileName = getFileNameByFighterObj(fighter);

  //File-exist-check recommended by https://flaviocopes.com/how-to-check-if-file-exists-node/
  fs.access(fileName, fs.F_OK, async (err) => {
    if (err) { //File does NOT exist yet, so create it
      await fs.promises.writeFile(fileName, JSON.stringify(fighter));
      console.log(`Created file ${fileName}`);
      updateListOfFighterFiles();


      return;
    }
    //File exists, overwrite it
    await fs.promises.writeFile(fileName, JSON.stringify(fighter));
    console.log(`Updated contents of file ${fileName}`);
  })
}

async function updateListOfFighterFiles() {
  const existingList = JSON.parse(fs.readFileSync("data/allFighters.json"));

  const newList = [];
  fs.readdirSync("data/fighters").forEach(fileName => {
    const exists = existingList.find(x => x.fileName.includes(fileName));
    if (!exists) {
      newList.push({ fileName, fighterAnsiName: getFighterAnsiNameFromFileName(fileName) });
    }
  });

  const combinedList = existingList.concat(newList);
  console.log("existingList", existingList.length, "newList:", newList.length,"CombinedList:", combinedList.length, );
  await fs.promises.writeFile("data/allFighters.json", JSON.stringify(combinedList));
  console.log(`Updated allFighters.json`);
  return;
}

function getFighterAnsiNameFromFileName(fileName) {
  let fighterAnsiName = fileName.replace(/_/g, " ").replace("(fighter)", "").replace(".json", "");
  fighterAnsiName = decodeURIComponent(fighterAnsiName);
  fighterAnsiName = removeDiacritics(fighterAnsiName).trim();
  return fighterAnsiName;
}

module.exports = {
  readFileByFighterObj,
  readFileByShortFileName,
  saveFighter,
  updateListOfFighterFiles,
}
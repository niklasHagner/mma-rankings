module.exports.uniqueBy = function (arr, prop) {
  return arr.reduce((acc, item) => {
    if (!acc.includes(item[prop])) { acc.push(item); }
    return acc;
  }, []);
}
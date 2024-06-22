module.exports.uniqueBy = function (arr, prop) {
    return arr.reduce((acc, item) => {
      if (!acc.some(accItem => accItem[prop] === item[prop])) {
        acc.push(item);
      }
      return acc;
    }, []);
  }
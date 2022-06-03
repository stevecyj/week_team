const filterParams = (obj) => {
  let _newObj = {};

  for (let key in obj) {
    // 過濾資料
    if (
      (obj[key] === 0 || obj[key] === false || obj[key]) &&
      obj[key].toString().replace(/(^\s*)|(\s*$)/g, '') !== ''
    ) {
      _newObj[key] = obj[key];
    }
  }

  return _newObj;
};

module.exports = {
  filterParams,
};

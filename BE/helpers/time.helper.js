
const getVNTime = () => {
  const now = new Date();
  return new Date(now.getTime() + 7 * 60 * 60 * 1000);
};

const getVNTimeString = () => {
  return getVNTime().toISOString();
};

module.exports = {
  getVNTime,
  getVNTimeString,
};

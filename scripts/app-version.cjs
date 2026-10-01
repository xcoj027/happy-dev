function getAppVersion() {
  const version = process.env.APP_VERSION || 'local';
  if (version !== 'local' && !/^v\.[1-9]\d*$/.test(version)) {
    throw new Error('APP_VERSION must be local or v.N, where N is a positive integer.');
  }
  return version;
}

module.exports = { getAppVersion };

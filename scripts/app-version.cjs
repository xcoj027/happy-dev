function getAppVersion() {
  const version = process.env.APP_VERSION || 'local';
  if (version !== 'local' && !/^v[1-9]\d*\.\d+$/.test(version) && !/^v\.[1-9]\d*$/.test(version)) {
    throw new Error('APP_VERSION must be local or vM.m (e.g. v1.0, v1.1).');
  }
  return version;
}

module.exports = { getAppVersion };

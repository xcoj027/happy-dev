const { getAppVersion } = require('./scripts/app-version.cjs');

const config = {
  "appId": "com.happydev.app",
  "productName": "HappyDev",
  "directories": {
    "output": "release/${version}"
  },
  "compression": "maximum",
  "afterAllArtifactBuild": "scripts/optimize-dmg.cjs",
  "electronLanguages": ["en", "vi"],
  "nodeGypRebuild": false,
  "npmRebuild": false,
  "asar": true,
  "files": [
    "dist/**/*",
    "dist-electron/**/*",
    "public/**/*",
    "!**/node_modules/**"
  ],
  "mac": {
    "target": [{ "target": "dmg", "arch": ["universal"] }],
    "artifactName": "${productName}-${version}-mac-${arch}.${ext}",
    "category": "public.app-category.developer-tools",
    "icon": "public/icon.icns",
    "electronLanguages": ["en", "vi"],
    "darkModeSupport": true,
    "minimumSystemVersion": "12.0"
  },
  "dmg": {
    "format": "UDBZ",
    "internetEnabled": true
  },
  "win": {
    "target": [
      {
        "target": "nsis",
        "arch": ["x64"]
      }
    ],
    "artifactName": "${productName}-${version}-win-${arch}.${ext}",
    "icon": "public/icon.png"
  },
  "nsis": {
    "artifactName": "${productName}-${version}-windows-${arch}-setup.${ext}",
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "shortcutName": "HappyDev",
    "differentialPackage": false
  },
  "linux": {
    "target": [{ "target": "AppImage", "arch": ["x64"] }],
    "artifactName": "${productName}-${version}-linux-${arch}.${ext}",
    "maintainer": "TNQSW <qui894@gmail.com>",
    "category": "Development",
    "icon": "public/icon.png"
  }
};

const version = getAppVersion();
for (const platform of ['mac', 'win', 'nsis', 'linux']) {
  config[platform].artifactName = config[platform].artifactName.replace('${version}', version);
}
config.extraMetadata = { displayVersion: version };
module.exports = config;

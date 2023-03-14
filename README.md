# electron-nedb-todolist

A todo list demo app integrates NeDB with Electron

1. Build MAC: electron-packager . --overwrite --platform=darwin --arch=x64 --icon=assets/icons/mac/icon.icns --prune=true --out=release-builds
2. Build Window: electron-packager . electron-tutorial-app --overwrite --platform=win32 --arch=ia32 --icon=assets/icons/win/icon.ico --prune=true --out=release-builds --version-string.CompanyName=CE --version-string.FileDescription=CE --version-string.ProductName="Electron Tutorial App"
3. Build LINUX: electron-packager . electron-tutorial-app --overwrite --platform=linux --arch=x64 --icon=assets/icons/png/1024x1024.png --prune=true --out=release-builds

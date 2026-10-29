const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const cli = require.resolve('@electron-forge/cli/package.json');
const core = require.resolve('@electron-forge/core', {paths:[path.dirname(cli)]});
const packager = require(require.resolve('@electron/packager', {paths:[path.dirname(core)]}));
const pkg = require('../package.json');
const stage = path.join(root, 'build-output', `stage-${pkg.version}`);
fs.mkdirSync(stage, {recursive:true});
for (const name of ['main','preload','renderer']) fs.cpSync(path.join(root,'out',name),path.join(stage,'out',name),{recursive:true});
fs.cpSync(path.join(root,'resources'),path.join(stage,'resources'),{recursive:true});
fs.writeFileSync(path.join(stage,'package.json'),JSON.stringify({name:pkg.name,productName:'NeowFocus',version:pkg.version,main:'out/main/index.js'},null,2));
(async()=>{
 const outputs=await packager({dir:stage,name:'NeowFocus',platform:'mas',arch:'universal',electronVersion:require('electron/package.json').version,
 out:path.join(root,'build-output','packages'),overwrite:true,asar:true,prune:false,
 appBundleId:'com.neowfocus.pomodorotimer',appCategoryType:'public.app-category.productivity',appVersion:pkg.version,buildVersion:pkg.version,
 icon:path.join(root,'build','compiled','AppIcon.icns'),
 extraResource:['chrome-extension','build/native/focus-cloud.node','build/compiled/Assets.car','build/compiled/AppIcon.icns','resources/tray.png','resources/tray@2x.png'].map(p=>path.join(root,p)),
 extendInfo:{ITSAppUsesNonExemptEncryption:false,CFBundleIconName:'AppIcon',LSMinimumSystemVersion:'11.0.0',NSHighResolutionCapable:true},
 osxUniversal:{singleArchFiles:'**/focus-cloud.node'}
 });
 console.log(JSON.stringify({version:pkg.version,outputs}));
})().catch(error=>{console.error(error);process.exitCode=1});

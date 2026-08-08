const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const vbsContent = `
Set WshShell = CreateObject("WScript.Shell")
Set shortcut = WshShell.CreateShortcut("${path.join(__dirname, 'NativeBOX_AI_Player.lnk').replace(/\\/g, '\\\\')}")
shortcut.TargetPath = "${path.join(__dirname, 'Electron앱_실행.bat').replace(/\\/g, '\\\\')}"
shortcut.WorkingDirectory = "${__dirname.replace(/\\/g, '\\\\')}"
shortcut.Description = "NativeBOX AI Player (Smart App Control Safe)"
shortcut.Save
`;

fs.writeFileSync(path.join(__dirname, 'make_lnk.vbs'), vbsContent, 'utf-8');
execSync('cscript //nologo make_lnk.vbs', { cwd: __dirname });
fs.unlinkSync(path.join(__dirname, 'make_lnk.vbs'));
console.log('Shortcut created successfully!');

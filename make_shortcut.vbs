Set WshShell = CreateObject("WScript.Shell")
Set shortcut = WshShell.CreateShortcut("NativeBOX_AI_Player.lnk")
shortcut.TargetPath = WshShell.CurrentDirectory & "\Electron앱_실행.bat"
shortcut.WorkingDirectory = WshShell.CurrentDirectory
shortcut.Description = "NativeBOX AI Player (Smart App Control Safe)"
shortcut.Save

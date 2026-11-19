@echo off

set "PROJECT=D:\projects-shubham\02.06.2026\cursor_projects\system_design_guide"

wt ^
new-tab --title "Server" cmd /k "cd /d %PROJECT% && serve -s dist" ^
; new-tab --title "Browser" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:4000"






@REM @echo off

@REM REM Add directory to PATH for this session
@REM set "PATH=D:\projects-shubham\02.06.2026\cursor_projects\system_design_guide;%PATH%"

@REM REM Change to project directory
@REM cd /d D:\projects-shubham\02.06.2026\cursor_projects\system_design_guide

@REM REM Tab/Window 1 - Start the server
@REM start "Server" cmd /k "cd /d D:\projects-shubham\02.06.2026\cursor_projects\system_design_guide && serve -s dist"

@REM REM Tab/Window 2 - Wait and open browser
@REM start "Browser" cmd /k "timeout /t 2 /nobreak >nul && start http://localhost:3000"


























@REM @echo off

@REM REM Add a directory to PATH for this session
@REM set "PATH=D:\projects-shubham\02.06.2026\cursor_projects\system_design_guide;%PATH%"

@REM REM Change to your project directory (optional)
@REM cd /d D:\projects-shubham\02.06.2026\cursor_projects\system_design_guide

@REM REM Run your command
@REM serve -s dist\

@REM REM Wait a couple of seconds for the server to start
@REM timeout /t 2 /nobreak >nul

@REM REM Open the browser
@REM start http://localhost:3000

@REM pause


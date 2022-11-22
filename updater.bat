@ECHO OFF
@ECHO ============================= Terminating all program instance =============================
TASKKILL /IM thriveva-desktop-app.exe /F
@ECHO ================================ Running installer updates =================================
START %userprofile%\Downloads\installer\ThriveVA.exe
PAUSE
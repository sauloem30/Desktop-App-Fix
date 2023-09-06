@ECHO OFF
@ECHO ============================= Terminating all program instance =============================
TASKKILL /IM klever-desktop-app.exe /F
@ECHO ================================ Running installer updates =================================
START %userprofile%\Downloads\installer\Klever.exe
PAUSE
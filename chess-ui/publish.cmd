::rem Build app...
::npm run build

rem Deploying on gcloud...
gcloud app deploy --project=deep-chess-ui

rem Done!
pause
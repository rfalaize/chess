::rem Build app...
::npm run build

rem Deploying on gcloud...
::gcloud app deploy --project=deep-chess-ui
gsutil cp ./build gs://rhome-ai

rem Done!
pause
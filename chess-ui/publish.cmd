::rem Build app...
npm run build

::rem Deploying on gcloud storage...
::gsutil -m cp -r ./build/* gs://www.rhome.ai/

rem Deploying to firebase...
firebase deploy

rem Done!
pause
::rem Build app...
::npm run build

rem Deploying on gcloud...
gsutil -m cp -r ./build/* gs://www.rhome.ai/

rem Done!
pause
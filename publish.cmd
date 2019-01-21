rem Push on github...
git push

rem Deploying on gcloud...
cd ./chess-engine
gcloud app deploy --project=deep-chess-229318

rem Done!
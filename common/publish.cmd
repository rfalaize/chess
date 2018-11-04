rem Publish npm module...
cd ./../deep-chess-engine

rem Increment version...
call npm version patch
::call npm version minor
::call npm version major

rem Publish engine...
call npm publish --access=public

rem Update dependencies...

cd ./../deep-chess-ui
call npm install @rfalaize/deep-chess-engine

cd ./../deep-chess-server
call npm install @rfalaize/deep-chess-engine

rem Done !
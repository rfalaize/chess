rem Publish npm module...
cd ./../deep-chess-engine

rem Increment patch...
npm version patch
::npm version minor
::npm version major

rem Publish engine...
npm publish --access=public

rem Update dependencies...

cd ./../deep-chess-ui
npm install @rfalaize/deep-chess-engine

cd ./../deep-chess-server
npm install @rfalaize/deep-chess-engine

rem Done !
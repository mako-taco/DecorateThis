PACKAGE_VERSION=`node -e "console.log(JSON.parse(require('fs').readFileSync('package.json')).version);"`
gulp test && npm publish && git tag v$PACKAGE_VERSION && git push --tags
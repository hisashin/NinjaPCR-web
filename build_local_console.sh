echo "Building local console."
./node_modules/.bin/babel production/console/js-ES6/form.js  > production/console/js/form.js production/console/js/form.js
mkdir -p tmp/NinjaPCR
mkdir tmp/NinjaPCR/en
mkdir tmp/NinjaPCR/ja
cp -r production/console tmp/NinjaPCR
cp -r production/ja/console tmp/NinjaPCR/ja
cp -r production/en/console tmp/NinjaPCR/en
find tmp -name '*.psd' | xargs rm

rm -rf android/app/src/main/assets/NinjaPCR_console/*
cp -r tmp/NinjaPCR/* android/app/src/main/assets/NinjaPCR_console/

rm -rf ios/NinjaPCR/NinjaPCR/Resources/data.bundle/NinjaPCR_console/*
cp -r tmp/NinjaPCR/* ios/NinjaPCR/NinjaPCR/Resources/data.bundle/NinjaPCR_console/

cd tmp
zip -r ../NinjaPCR.zip NinjaPCR
cd ..
mv NinjaPCR.zip production/download
rm -rf tmp

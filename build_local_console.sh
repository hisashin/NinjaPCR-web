echo "Building local console."

mkdir -p tmp/NinjaPCR
mkdir tmp/NinjaPCR/en
mkdir tmp/NinjaPCR/ja
cp -r production/console tmp/NinjaPCR
cp -r production/ja/console tmp/NinjaPCR/ja
cp -r production/en/console tmp/NinjaPCR/en
cd tmp
zip -r ../NinjaPCR.zip NinjaPCR
cd ..
mv NinjaPCR.zip production/download
rm -rf tmp

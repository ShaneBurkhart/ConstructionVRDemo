make prod_clean
rm -rf data/pg
unzip demo_backup.zip
mv root/ConstructionVRDemo/data/pg data/pg
rm -rf root
make prod_run
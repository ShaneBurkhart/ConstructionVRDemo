ZIP_NAME=`date +"%Y-%m-%d"_backup.zip`
zip -r /home/ubuntu/${ZIP_NAME} /data/finish-vision* /etc/letsencrypt
docker run --rm --env-file /home/ubuntu/ConstructionVRDemo-Prod/user.env -v /home/ubuntu:/data amazon/aws-cli s3 cp /data/${ZIP_NAME} s3://finish-vision-vr/backups/${ZIP_NAME}
rm /home/ubuntu/${ZIP_NAME}

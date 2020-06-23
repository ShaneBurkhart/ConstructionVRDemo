ZIP_NAME=`date +"%Y-%m-%d"_backup.zip`
zip -r /root/${ZIP_NAME} /data /etc/letsencrypt
docker run --rm --env-file /root/PlanSource/user.env -v /root:/data amazon/aws-cli s3 cp /data/${ZIP_NAME} s3://PlanSource/backups/${ZIP_NAME}
rm /root/${ZIP_NAME}

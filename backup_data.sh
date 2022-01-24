#ZIP_NAME=`date +"%Y-%m-%d"_backup.zip`
sudo zip -r /root/ConstructionVRDemo/demo_backup.zip /root/ConstructionVRDemo/data
#docker run --rm --env-file /home/ubuntu/ConstructionVRDemo-Prod/user.env -v /home/ubuntu:/data amazon/aws-cli s3 cp /data/${ZIP_NAME} s3://finish-vision-vr/backups/${ZIP_NAME}
#rm -f /home/ubuntu/${ZIP_NAME}

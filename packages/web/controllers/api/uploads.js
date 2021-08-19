const AWS = require('aws-sdk');
const m = require("../middleware.js");
const { uuid } = require('uuidv4');

AWS.config.update({
  region: process.env["AWS_REGION"],
  credentials: new AWS.Credentials(process.env["AWS_ACCESS_KEY_ID"], process.env["AWS_SECRET_ACCESS_KEY"])
});
const s3 = new AWS.S3({ params: { Bucket: process.env.BUCKET } });

module.exports = (app) => {
  app.post("/api2/v2/uploads/presigned_url", m.authUser, (req, res) => {
    const filename = req.body.filename;
    const mime = req.body.mime;

    const myBucket = process.env.BUCKET;
    const myKey = `tmp/${uuid()}_${filename}`;
    const signedUrlExpireSeconds = 60 * 5;
    try {
      const url = s3.getSignedUrl('putObject', {
        Bucket: myBucket,
        Key: myKey,
        ContentType: mime,
        ContentDisposition: `attachment; filename='${filename}'`,
        ACL: "public-read",
        Expires: signedUrlExpireSeconds
      }, (err, url) => {
        if (err) return res.status(422).send("Could not complete configuration for upload");
        
        const encodedKey = encodeURIComponent(myKey)
        res.json({
          presignedURL: url,
          awsURL: `https://${myBucket}.s3-us-west-2.amazonaws.com/${encodedKey}`,
        });
      })
    } catch (error) {
      res.status(422).send("Could not complete upload request");
    }
  });
}

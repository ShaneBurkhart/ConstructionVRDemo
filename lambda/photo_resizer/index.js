var async = require('async');
var path = require('path');
var AWS = require('aws-sdk');
var gm = require('gm').subClass({
    imageMagick: true
});
var util = require('util');
var s3 = new AWS.S3();

// All images are
var VALID_EXT = ['png', 'jpg', 'jpeg', 'tiff', 'gif'];
var PANO_SIZES = [
  { name: 'medium', max_width: 1024, max_height: 512 },
  { name: 'small', max_width: 2048, max_height: 1024 },
];
var PHOTO_SIZES = [
  { name: 'large', max_width: 1280, max_height: 720 },
];

var getS3Object = function (bucket, key, callback) {
  s3.getObject({
    Bucket: bucket,
    Key: key,
  }, callback);
};

var putS3Object = function (bucket, key, buffer, contentType, callback) {
  s3.putObject({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
  }, callback);
};

var createResizeTask = function (bucket, key, destKey, extension, photoSize) {
  return function (resizeCallback) {
    async.waterfall([
      function download(next) {
        // Download the image from S3 into a buffer.
        getS3Object(bucket, key, next);
      },

      function tranform(response, transformCallback) {
        // autoOrient() to fix photo orientation when not corrected by camera
        gm(response.Body).autoOrient().size(function(err, size) {
          if (err) return transformCallback(err);

          var scalingFactor = Math.min(
            photoSize.max_width / size.width,
            photoSize.max_height / size.height
          );

          var width = scalingFactor * size.width;
          var height = scalingFactor * size.height;

          // Infer the scaling factor to avoid stretching the image unnaturally.
          // Transform the image buffer in memory.
          this.resize(width, height)
            .toBuffer(extension, function(err, buffer) {
              if (err) return transformCallback(err);

              // Stream the transformed image to a different S3 bucket.
              transformCallback(null, response.ContentType, buffer);
            });
        });
      },

      function upload(contentType, data, next) {
        // Stream the transformed image to a different S3 bucket.
        putS3Object(bucket, destKey, data, contentType, next);
      }],

      function (err) {
        if (err) {
          console.error(
            'Unable to resize ' + bucket + '/' + key +
            ' and upload to ' + bucket + '/' + destKey +
            ' due to an error: ' + err
          );
          return resizeCallback(err);
        }

        console.log(
          'Successfully resized ' + bucket + '/' + key +
          ' and uploaded to ' + bucket + '/' + destKey
        );
        resizeCallback();
      }
    );
  };
};

exports.handler = function (event, context, callback) {
  var bucket = event.Records[0].s3.bucket.name;
  var key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

  // Infer the image type.
  var ext = key.split(".").pop();
  if (!ext) {
    console.error('Unable to infer image type for key ' + key);
    return;
  }

  if (VALID_EXT.indexOf(ext.toLowerCase()) < 0) {
    console.log('Skipping non-image ' + key);
    return;
  }

  // Create tasks and run in parellel for all the photo sizes.
  var tasks = [];
  var photoSizes = PHOTO_SIZES;
  var keyParts = key.split("/");
  var originalDir = keyParts[0];

  if (originalDir === "panos") photoSizes = PANO_SIZES;

  for (var i = 0; i < photoSizes.length; i++) {
    var photoSize = photoSizes[i];
    keyParts.splice(0, 1, originalDir + "-" + photoSize.name);

    var destKey = keyParts.join("/");
    tasks.push(createResizeTask(bucket, key, destKey, ext, photoSize));
  }

  async.series(tasks, function (err) {
    if (err) context.done(err);
    context.done();
  });
}

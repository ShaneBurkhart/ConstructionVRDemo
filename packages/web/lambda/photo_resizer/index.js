var async = require('async');
var path = require('path');
var AWS = require('aws-sdk');
var sharp = require('sharp');
var util = require('util');
var s3 = new AWS.S3();

// All images are
var VALID_EXT = ['png', 'jpg', 'jpeg', 'tiff', 'gif'];
var PANO_SIZES = [
  { name: 'tiny', max_width: 512, max_height: 256 },
  { name: 'small', max_width: 1024, max_height: 512 },
  { name: 'medium', max_width: 2048, max_height: 1024 },
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
    Metadata: {
      'Cache-Control': 'max-age=31536000',
    },
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
        var img = sharp(response.Body).rotate();

        img.metadata(function(err, metadata) {
          console.log("Measuring Size.");
          if (err) return transformCallback(err);
          console.log("Calculating Size.");

          var scalingFactor = Math.min(
            photoSize.max_width / metadata.width,
            photoSize.max_height / metadata.height
          );

          var width = Math.round(scalingFactor * metadata.width);
          var height = Math.round(scalingFactor * metadata.height);

          // Infer the scaling factor to avoid stretching the image unnaturally.
          // Transform the image buffer in memory.
          img.resize(width, height, { fit: "contain", withoutEnlargement: true })
            .toBuffer(function(err, buffer) {
              console.log("Resizing.");
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

var createUpdateImageMetadataTask = function(bucket, key) {
  return function(callback) {
    var contentType;

    if (key.endsWith(".jpg")) {
      contentType = "image/jpeg";
    } else if(key.endsWith(".png")) {
      contentType = "image/png";
    }

    // Change the Metadata for Cache-Control.
    s3.copyObject({
      CopySource: "/" + bucket + "/" + key,
      Bucket: bucket,
      Key: key,
      ACL: 'public-read',
      ContentType: contentType,
      CacheControl: 'max-age=31536000',
      MetadataDirective: "REPLACE",
    }, callback);
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

  // Update metadata of original before resizing everything.
  tasks.push(createUpdateImageMetadataTask(bucket, key));

  for (var i = 0; i < photoSizes.length; i++) {
    var photoSize = photoSizes[i];
    keyParts.splice(0, 1, originalDir + "-" + photoSize.name);

    var destKey = keyParts.join("/");
    tasks.push(createResizeTask(bucket, key, destKey, ext, photoSize));
  }

  async.series(tasks, callback);
}

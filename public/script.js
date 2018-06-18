$(document).ready(function () {
  var $fullscreenButton = $(".fullscreen-toggle");
  var $logCoordButton = $(".log-coord");
  var panoElement = document.getElementById('pano-window');
  var $panoElement = $('#pano-window');
  var $feedbackToggleButton = $('#pano-window .controls .feedback-toggle');
  var $fullscreenFeedbackContainer = $('#pano-window .fullscreen-feedback');
  var $panoPreviews = $('#pano-previews .pano-preview');
  var $fullscreenSubmitFeedback = $("#fullscreen-feedback-submit");
  var $fullscreenFeedbackInput = $("#fullscreen-feedback-input");
  var $feedbackInput = $("#feedback-input");
  var $submitFeedback = $("#feedback-submit");
  var $feedbacks = $("#feedbacks");
  var $unitFloorPlan = $("#unit-floor-plan");
  var $feedbackFileButtons = $(".feedback-add-file");
  var $feedbackPerspectiveLinks = $(".feedback .perspective-link");
  var $feedbackFileUpload = $("#feedback-file-upload");

  AWS.config.update({
    region: "us-west-2",
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: AWS_IDENTITY_POOL_ID,
    })
  });

  var s3 = new AWS.S3({ params: { Bucket: "construction-vr" } });

  var viewerOpts = {
    controls: {
      mouseViewMode: 'drag'    // drag|qtvr
    },
    stage: {
      width: 100,
      preserveDrawingBuffer: true,
    }
  };

  var viewer = new Marzipano.Viewer(panoElement, viewerOpts)

  var levels = [
    { width: 4096 },
  ];

  var geometry = new Marzipano.EquirectGeometry(levels);
  var limiter = Marzipano.util.compose(
    Marzipano.RectilinearView.limit.vfov(0.698131111111111, 2.09439333333333),
    Marzipano.RectilinearView.limit.hfov(0.698131111111111, 2.09439333333333),
    Marzipano.RectilinearView.limit.pitch(-Math.PI/2, Math.PI/2)
  );
  var view = new Marzipano.RectilinearView({ fov: 2.094 }, limiter);

  var _currentPano = null;
  var _panos = {};

  for (var key in _panoData) {
    var data = _panoData[key];
    var source = Marzipano.ImageUrlSource.fromString(data["Image"][0]["url"]);
    var recordId = data["Record ID"];

    _panos[recordId] = {
      data: data,
      scene: viewer.createScene({ source: source, geometry: geometry, view: view }),
    };
  }

  function switchToPanoId(panoId) {
    _currentPano = _panos[panoId];
    _currentPano.scene.switchTo();
    showLinkHotspots();
    updatePanoPreviews();
  }

  function createLinkHotspotElement(label, destId) {
    return $("<div><div class='link-hotspot' data-id='" + destId + "'>" + label + "</div></div>");
  }

  function showLinkHotspots() {
    var panoData = _currentPano.data;
    var linkHotspots = panoData["link_hotspots"];

    for (var key in linkHotspots) {
      var hotspot = linkHotspots[key];
      var destinationRecordId = hotspot["Destination Pano"][0];
      var destinationName = hotspot["Destination Pano Name"][0];
      var $element = createLinkHotspotElement(destinationName, destinationRecordId);

      // This copies the variable so we can use it later without it changing.
      function addClickListener(destPanoId) {
        $element.click(function () { switchToPanoId(destPanoId); });
      }

      addClickListener(destinationRecordId);
      _currentPano.scene.hotspotContainer().createHotspot($element.get(0), { yaw: hotspot["Yaw"], pitch: hotspot["Pitch"] });
    }
  }

  function updatePanoPreviews() {
    var panoData = _currentPano.data;

    $panoPreviews.each(function () {
      var $this = $(this);
      var panoId = $this.data("id");

      if ($this.hasClass("selected")) $this.removeClass("selected");
      if (panoId == panoData["Record ID"]) $this.addClass("selected");
    });
  }

  // Show first pano
  switchToPanoId(_panoData[0]["Record ID"]);


  $feedbackToggleButton.click(function () {
    if ($fullscreenFeedbackContainer.hasClass("open")) {
      $feedbackToggleButton.text("Give Feedback");
      $fullscreenFeedbackContainer.removeClass("open");
    } else {
      $feedbackToggleButton.text("Hide Feedback");
      $fullscreenFeedbackContainer.addClass("open");
      // focus input when opening the feedback container.
      setTimeout(function () { $fullscreenFeedbackInput.focus(); }, 0);
    }
  });

  $fullscreenButton.click(function () {
    if ($panoElement.hasClass('fullscreen')) {
      $panoElement.removeClass('fullscreen');
    } else {
      $panoElement.addClass('fullscreen');
    }

    viewer.updateSize();
  });

  $logCoordButton.click(function (e) {
    e.preventDefault();

    var viewParams = view.parameters();
    var yaw = viewParams["yaw"];
    var pitch = viewParams["pitch"];

    console.log(yaw + "\t" + pitch);
  });

  function addFeedbackToList(feedbackText, panoName) {
    var $feedbackTemplate = $("#feedback-template .feedback");
    var $newFeedback = $feedbackTemplate.clone();

    $newFeedback.find(".notes").html(feedbackText.replace(/\n/g, "<br>"));
    $newFeedback.find(".pano_name").text(panoName);
    $newFeedback.find(".created_at").text("(now)");

    $feedbacks.prepend($newFeedback);
    $feedbacks.prepend($("<hr>"));
  }

  var isRequesting = false;
  var submitFeedback = function (feedbackText) {
    if (isRequesting) return;
    isRequesting = true;
    $fullscreenFeedbackInput.prop("disabled", true);
    $fullscreenFeedbackInput.addClass("disabled");
    $feedbackInput.prop("disabled", true);
    $feedbackInput.addClass("disabled");
    $feedbackFileButtons.addClass("hidden");
    $fullscreenSubmitFeedback.text("Submitting...");
    $submitFeedback.text("Submitting...");

    var panoId = _currentPano.data["Record ID"];
    var panoName = _currentPano.data["Name"];

    $.ajax({
      type: "POST",
      url: "/project/" + _accessToken + "/pano/" + panoId + "/feedback",
      data: {
        notes: feedbackText,
        viewParameters: JSON.stringify(view.parameters()),
      },
      complete: function (xhr, status) {
        if (xhr.status === 200) {
          $fullscreenFeedbackInput.val("");
          $feedbackInput.val("");
          $feedbackToggleButton.text("Give Feedback");
          $fullscreenFeedbackContainer.removeClass("open");

          addFeedbackToList(feedbackText, panoName);
        }

        $fullscreenSubmitFeedback.text("Submit Feedback");
        $submitFeedback.text("Submit Feedback");
        $feedbackFileButtons.removeClass("hidden");
        $fullscreenFeedbackInput.removeClass("disabled");
        $fullscreenFeedbackInput.prop("disabled", false);
        $feedbackInput.removeClass("disabled");
        $feedbackInput.prop("disabled", false);
        isRequesting = false;
      },
    });
  };

  $fullscreenSubmitFeedback.click(function () {
    var feedbackText = $fullscreenFeedbackInput.val();
    if (!feedbackText.length) return;

    submitFeedback(feedbackText);
  });

  $submitFeedback.click(function () {
    var feedbackText = $feedbackInput.val();
    if (!feedbackText.length) return;

    submitFeedback(feedbackText);
  });

  $panoPreviews.click(function () {
    var $this = $(this);
    var destPanoId = $this.data("id");
    switchToPanoId(destPanoId);
  });

  $unitFloorPlan.find(".label").click(function () {
    var $this = $(this);
    var panoId = $this.data("id");
    switchToPanoId(panoId);
  });

  $feedbackPerspectiveLinks.click(function (e) {
    e.preventDefault();
    var $this = $(this);
    var perspective = $this.attr('data-perspective');
    var panoId = $this.attr('data-pano-id');
    var p;

    try {
        p = JSON.parse(perspective);
    } catch(e) {
        console.log(e);
    }

    if (p) {
      switchToPanoId(panoId);
      view.setParameters(p);
      anchorJump("pano-window");
      var jpegImage = viewer.stage().takeSnapshot();
      console.log(jpegImage);
    }
  });

  function updateFileUI (isUpload) {
    if (isUpload) {
      $fullscreenSubmitFeedback.addClass("hidden");
      $submitFeedback.addClass("hidden");
      $feedbackFileButtons.text("Uploading...");
      $fullscreenFeedbackInput.prop("disabled", true);
      $fullscreenFeedbackInput.addClass("disabled");
      $feedbackInput.prop("disabled", true);
      $feedbackInput.addClass("disabled");
    } else {
      $fullscreenFeedbackInput.removeClass("disabled");
      $fullscreenFeedbackInput.prop("disabled", false);
      $feedbackInput.removeClass("disabled");
      $feedbackInput.prop("disabled", false);
      $fullscreenSubmitFeedback.removeClass("hidden");
      $submitFeedback.removeClass("hidden");
      $feedbackFileButtons.text("Add File");
    }
  }

  function anchorJump(hash){
      var url = location.href;
      location.href = "#" + hash;
      // Change history back to original URL.
      history.replaceState(null, null, url);
  }

  function randId() {
    return 'xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function uploadToS3(file, fileName, callback) {
    s3.upload({
      Key: "feedback_uploads/" + fileName, Body: file, ACL: 'public-read'
    }, function (err, data) {
      if (err) return callback(err, null);

      var uploadLocation = data["Location"];
      callback(null, uploadLocation);
    });

  }

  var isUploading = false;
  $feedbackFileUpload.change(function () {
    if (isUploading) return;
    isUploading = true;
    updateFileUI(true);

    var $this = $(this);
    var files = $this.get(0).files;
    if (!files.length) return alert('Please choose a file to upload first.');

    var file = files[0];
    var fileName = randId() + "_" + file.name.replace(/\s+/g,"_");

    uploadToS3(file, fileName, function(err, uploadLocation) {
      if (err) {
        updateFileUI(false);
        isUploading = false;
        return alert('There was an error uploading your photo: ', err.message);
      }

      var fullscreenText = $fullscreenFeedbackInput.val() || "";
      var text = $feedbackInput.val() || "";

      if (fullscreenText.length) fullscreenText += "\n\n";
      if (text.length) text += "\n\n";

      fullscreenText += uploadLocation;
      text += uploadLocation;

      $fullscreenFeedbackInput.val(fullscreenText);
      $feedbackInput.val(text);

      updateFileUI(false);
      isUploading = false;
    });
  });

  $feedbackFileButtons.click(function () {
    if (isUploading) return;
    $feedbackFileUpload.click();
  });
});

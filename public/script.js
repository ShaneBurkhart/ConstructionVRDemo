$(document).ready(function () {
  var $fullscreenButton = $(".fullscreen-toggle");
  var $logCoordButton = $(".log-coord");
  var $setLinkHotspotButton = $(".set-link-hotspot");
  var $setInitialYawButton = $(".set-initial-yaw");
  var panoElement = document.getElementById('pano-window');
  var $panoElement = $('#pano-window');
  var $feedbackToggleButton = $('#pano-window .controls .feedback-toggle');
  var $fullscreenFeedbackContainer = $('#pano-window .fullscreen-feedback');
  var $panoPreviews = $('#pano-previews .pano-preview');
  var $fullscreenSubmitFeedback = $("#fullscreen-feedback-submit");
  var $fullscreenFeedbackInput = $("#fullscreen-feedback-input");
  var $feedbackInput = $("#feedback-input");
  var $feedbackInput = $("#feedback-input");
  var $feedbackIsFixInput = $("#feedback-is-fix");
  var $submitFeedback = $("#feedback-submit");
  var $feedbacks = $("#feedbacks");
  var $unitFloorPlan = $("#unit-floor-plan");
  var $feedbackFileButtons = $(".feedback-add-file");
  var $feedbackPerspectiveLinks = $(".feedback .perspective-link");
  var $feedbackFileUpload = $("#feedback-file-upload");
  var $virtualTourToggleButton = $(".virtual-tour-toggle");
  var $virtualTourSection = $("#virtual-tour");

  var IS_PICKING_LINK_HOTSPOT = false;

  AWS.config.update({
    region: "us-west-2",
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: AWS_IDENTITY_POOL_ID,
    })
  });

  var s3 = new AWS.S3({ params: { Bucket: "construction-vr" } });

  var viewer, view;
  var _currentPano = null;
  var _panos = {};

  function initViewer() {
    var viewerOpts = {
      controls: {
        mouseViewMode: 'drag'    // drag|qtvr
      },
      stage: {
        width: 100,
        preserveDrawingBuffer: true,
      }
    };

    viewer = new Marzipano.Viewer(panoElement, viewerOpts)

    var levels = [
      { width: 4096 },
    ];

    var geometry = new Marzipano.EquirectGeometry(levels);
    var limiter = Marzipano.util.compose(
      Marzipano.RectilinearView.limit.vfov(0.698131111111111, 2.09439333333333),
      Marzipano.RectilinearView.limit.hfov(0.698131111111111, 2.09439333333333),
      Marzipano.RectilinearView.limit.pitch(-Math.PI/2, Math.PI/2)
    );
    view = new Marzipano.RectilinearView({ fov: 2.094 }, limiter);

    for (var key in _panoData) {
      var data = _panoData[key];
      var source = Marzipano.ImageUrlSource.fromString(data["Image URL"]);
      var recordId = data["Record ID"];

      _panos[recordId] = {
        data: data,
        scene: viewer.createScene({ source: source, geometry: geometry, view: view }),
      };
    }
  }

  function switchToPanoId(panoId) {
    _currentPano = _panos[panoId];
    _currentPano.scene.switchTo({ transitionDuration: 300 });
    _currentPano.scene.lookTo({ yaw: _currentPano.data["Initial Yaw"] || 0, pitch: 0 });
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

  // Only init if we have a pano element.
  if (panoElement) {
    initViewer();
    // Show first pano
    switchToPanoId(_panoData[0]["Record ID"]);
  }

  $virtualTourToggleButton.click(function (e) {
    e.preventDefault();
    var $this = $(this);
    var t = $this.text()

    if (t.includes("Show")) {
      $this.text("Hide Virtual Tour");
    } else {
      $this.text("Show Virtual Tour");
    }

    $virtualTourSection.toggle();
  });

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

  $setLinkHotspotButton.click(function (e) {
    e.preventDefault();

    var viewParams = view.parameters();
    var yaw = viewParams["yaw"];
    var pitch = viewParams["pitch"];

    $setLinkHotspotButton.attr('data-yaw', yaw);
    $setLinkHotspotButton.attr('data-pitch', pitch);

    IS_PICKING_LINK_HOTSPOT = true;
    $panoPreviews.addClass('select-pano');
  });

  $setInitialYawButton.click(function (e) {
    e.preventDefault();

    var viewParams = view.parameters();
    var yaw = viewParams["yaw"];

    updateInitialYaw(_currentPano.data["Record ID"], yaw);
  });

  function addFeedbackToList(feedback, panoName) {
    var feedbackId = feedback["Record ID"]
    var feedbackText = feedback["Notes"]
    var feedbackHTML = feedback["Notes HTML"]
    var $feedbackTemplate = $("#feedback-template .feedback");
    var $newFeedback = $feedbackTemplate.clone();
    var screenshotUrl = feedback["Screenshot"][0]["url"];

    $newFeedback.data("feedback-id", feedbackId);
    $newFeedback.find(".feedback-image").attr("href", screenshotUrl);
    $newFeedback.find(".feedback-image img").attr("src", screenshotUrl);
    $newFeedback.find(".notes").html(feedbackHTML);
    $newFeedback.find(".notes").html(feedbackHTML);
    $newFeedback.find(".notes-input").val(feedbackText);
    $newFeedback.find(".pano_name").text(panoName);
    $newFeedback.find(".created_at").text("(now)");

    $feedbacks.prepend($newFeedback);
    $feedbacks.prepend($("<hr>"));
  }

  var updateLinkHotspot = function(pano_id, dest_pano_id, yaw, pitch) {
    $.ajax({
      type: "POST",
      url: "/admin/linked_hotspot/set",
      data: {
        pano_id: pano_id,
        dest_pano_id: dest_pano_id,
        yaw: yaw,
        pitch: pitch,
      },
      complete: function (xhr, status) {
        if (xhr.status === 200) {
          console.log("Hotspot Updated.");
        }
      },
    });
  };

  var updateInitialYaw = function(pano_id, yaw) {
    $.ajax({
      type: "POST",
      url: "/admin/pano/initial_yaw/set",
      data: { pano_id: pano_id, yaw: yaw },
      complete: function (xhr, status) {
        if (xhr.status === 200) {
          console.log("Initial Yaw Updated.");
        }
      },
    });
  };

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

    var jpegBase64 = viewer.stage().takeSnapshot();
    var jpegData = dataURItoBlob(jpegBase64);
    var fileName = randId() + "_" + panoId + "_" + panoName.replace(/\s+/g,"_")  + ".jpeg";
    var filePath = "feedback_perspectives/" + fileName;
    var data = {
      unitVersionId: _unitVersionId,
      notes: feedbackText,
      isFix: $feedbackIsFixInput.is(":checked"),
    }
    var onComplete = function (xhr, status) {
      if (xhr.status === 200) {
        var feedback = JSON.parse(xhr.responseText);
        $fullscreenFeedbackInput.val("");
        $feedbackInput.val("");
        $feedbackToggleButton.text("Give Feedback");
        $fullscreenFeedbackContainer.removeClass("open");

        addFeedbackToList(feedback, panoName);
      }

      $fullscreenSubmitFeedback.text("Submit Feedback");
      $submitFeedback.text("Submit Feedback");
      $feedbackFileButtons.removeClass("hidden");
      $fullscreenFeedbackInput.removeClass("disabled");
      $fullscreenFeedbackInput.prop("disabled", false);
      $feedbackInput.removeClass("disabled");
      $feedbackInput.prop("disabled", false);
      isRequesting = false;
    };

    uploadToS3(jpegData, filePath, {}, function (err, s3Url) {
      data.screenshot = { filename: fileName, url: s3Url }
      data.viewParameters = JSON.stringify(view.parameters())

      $.ajax({
        type: "POST",
        url: "/project/" + _accessToken + "/pano/" + panoId + "/feedback",
        data: data,
        complete: onComplete,
      });
    });
  };

  $feedbackFileButtons.click(function () {
    if (isUploading) return;
    $feedbackFileUpload.click();
  });

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

  var updateFeedback = _.debounce(function (feedbackId, data, callback) {
    $.ajax({
      type: "POST",
      url: "/project/" + _accessToken + "/feedback_feed/" + feedbackId + "/update",
      data: data,
      complete: function (res) {
        var d = JSON.parse(res.responseText);
        if (callback) callback(d);
      },
    });
  }, 750);

  var toggleUpdateFeedback = function (e) {
    e.preventDefault();
    var $this = $(this);
    var $feedback = $this.closest(".feedback");
    var $showNotes = $feedback.find(".show-notes");
    var $editNotes = $feedback.find(".edit-notes");

    $showNotes.toggle();
    $editNotes.toggle();
  };

  var isUpdating = false;
  $feedbacks.on("click", ".feedback .edit-feedback", toggleUpdateFeedback);
  $feedbacks.on("click", ".feedback .cancel-update-feedback", toggleUpdateFeedback);
  $feedbacks.on("click", ".feedback .update-feedback", function (e) {
    e.preventDefault();
    if (isUpdating) return;
    isUpdating = true;

    var $this = $(this);
    var $feedback = $this.closest(".feedback");
    var $showNotes = $feedback.find(".show-notes");
    var $notes = $showNotes.find(".notes");
    var $editNotes = $feedback.find(".edit-notes");
    var $notesInput = $editNotes.find("textarea");
    var feedbackId = $feedback.data("feedback-id");
    var notes = $notesInput.val();

    $notesInput.prop("disabled", true);
    $notesInput.addClass("disabled");

    updateFeedback(feedbackId, { notes: notes }, function (f) {
      $notes.html(f["Notes HTML"] || "");
      $showNotes.toggle();
      $editNotes.toggle();
      $notesInput.prop("disabled", false);
      $notesInput.removeClass("disabled");
      isUpdating = false;
    });
  });

  $panoPreviews.click(function () {
    var $this = $(this);
    var destPanoId = $this.data("id");

    if (IS_PICKING_LINK_HOTSPOT) {
      var currentPanoId = _currentPano.data["Record ID"];
      var yaw = $setLinkHotspotButton.attr('data-yaw');
      var pitch = $setLinkHotspotButton.attr('data-pitch');

      updateLinkHotspot(currentPanoId, destPanoId, yaw, pitch);

      $panoPreviews.removeClass('select-pano');
      IS_PICKING_LINK_HOTSPOT = false;
    } else {
      switchToPanoId(destPanoId);
    }
  });

  $unitFloorPlan.find(".label").click(function () {
    var $this = $(this);
    var panoId = $this.data("id");
    switchToPanoId(panoId);
  });

  $feedbackPerspectiveLinks.click(function (e) {
    e.preventDefault();
    var $this = $(this);
  });

  var isUploading = false;
  $feedbackFileUpload.change(function () {
    if (isUploading) return;
    isUploading = true;
    updateFileUI(true);

    var $this = $(this);
    var files = $this.get(0).files;
    if (!files.length) return alert('Please choose a file to upload first.');

    var file = files[0];
    var filePath = "feedback_uploads/" + randId() + "_" + file.name.replace(/\s+/g,"_");

    uploadToS3(file, filePath, {}, function(err, uploadLocation) {
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

  function uploadToS3(data, filePath, opts, callback) {
    opts = opts || {};
    opts["Key"] = filePath;
    opts["Body"] = data;
    opts["ACL"] = 'public-read';

    s3.upload(opts, function (err, data) {
      if (err) return callback(err, null);

      var uploadLocation = data["Location"];
      callback(null, uploadLocation);
    });
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

  function dataURItoBlob(dataURI) {
      var binary = atob(dataURI.split(',')[1]);
      var array = [];

      for(var i = 0; i < binary.length; i++) {
          array.push(binary.charCodeAt(i));
      }

      return new Blob([new Uint8Array(array)], { type: 'image/jpeg' });
  }
});

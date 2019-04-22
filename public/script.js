$(document).ready(function () {
  var $fullscreenButton = $(".fullscreen-toggle");
  var $logCoordButton = $(".log-coord");
  var $setFloorPlanHotspotButton = $(".set-floor-plan-hotspot");
  var $removeFloorPlanHotspotButton = $(".remove-floor-plan-hotspot");
  var $floorPlanHotspotPanoPreviews = $('#floor-plan-hotspot-pano-previews .pano-preview');
  var $setLinkHotspotButton = $(".set-link-hotspot");
  var $removeLinkHotspotButton = $(".remove-link-hotspot");
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
  var $unitFloorPlan = $("#unit-floor-plan img");
  var $unitFloorPlanLabels = $("#unit-floor-plan .label");
  var $feedbackFileButtons = $(".feedback-add-file");
  var $feedbackPerspectiveLinks = $(".feedback .perspective-link");
  var $feedbackFileUpload = $("#feedback-file-upload");
  var $virtualTourToggleButton = $(".virtual-tour-toggle");
  var $virtualTourSection = $("#virtual-tour");

  // 0 = Nothing, 1 = Set, 2 = Remove
  var LINK_HOTSPOT_STATE = 0;
  // 0 = Nothing, 1 = Set, 2 = Remove
  var FLOOR_PLAN_HOTSPOT_STATE = 0;

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
      { width: 512 },
      { width: 4096 },
    ];

    var createSource = function(imageUrl) {
      return new Marzipano.ImageUrlSource(function (tile) {
        if (tile.z === 0) {
          return { url: imageUrl.replace("\/panos\/", "\/panos-tiny\/") };
        } else {
          return { url: imageUrl };
        }
      });
    };

    var geometry = new Marzipano.EquirectGeometry(levels);
    var limiter = Marzipano.util.compose(
      Marzipano.RectilinearView.limit.vfov(0.698131111111111, 2.09439333333333),
      Marzipano.RectilinearView.limit.hfov(0.698131111111111, 2.09439333333333),
      Marzipano.RectilinearView.limit.pitch(-Math.PI/2, Math.PI/2)
    );
    view = new Marzipano.RectilinearView({ fov: 2.094 }, limiter);

    for (var key in _panoData) {
      var data = _panoData[key];
      var recordId = data["Pano ID"][0];
      var source = createSource(data["Image URL"]);

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
      var destinationPanoVersionId = hotspot["destination_pano_version_id"];
      var destinationPanoId = null;
      var destinationName = null;

      for (var pano_id in _panos) {
        var pv = _panos[pano_id];
        if (pv.data["Record ID"] == destinationPanoVersionId) {
          destinationPanoId = pano_id;
          destinationName = pv.data["Pano Name"][0];
          break;
        }
      }
      if (!destinationPanoId) continue;
      var $element = createLinkHotspotElement(destinationName, destinationPanoId);

      // This copies the variable so we can use it later without it changing.
      function addClickListener(destPanoId) {
        $element.click(function () { switchToPanoId(destPanoId); });
      }

      addClickListener(destinationPanoId);
      _currentPano.scene.hotspotContainer().createHotspot($element.get(0), { yaw: hotspot["yaw"], pitch: hotspot["pitch"] });
    }
  }

  function updatePanoPreviews() {
    var panoData = _currentPano.data;

    $panoPreviews.each(function () {
      var $this = $(this);
      var panoId = $this.data("id");

      if ($this.hasClass("selected")) $this.removeClass("selected");
      if (panoId == panoData["Pano ID"][0]) $this.addClass("selected");
    });
  }

  // Only init if we have a pano element.
  if (panoElement) {
    initViewer();
    // Show first pano
    switchToPanoId(_panoData[0]["Pano ID"][0]);
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

  $setFloorPlanHotspotButton.click(function (e) {
    e.preventDefault();
    FLOOR_PLAN_HOTSPOT_STATE = 1;
    $floorPlanHotspotPanoPreviews.addClass('select-pano');
  });

  $removeFloorPlanHotspotButton.click(function (e) {
    e.preventDefault();
    FLOOR_PLAN_HOTSPOT_STATE = 2;
    $floorPlanHotspotPanoPreviews.addClass('select-pano');
  });

  $floorPlanHotspotPanoPreviews.click(function (e) {
    e.preventDefault();
    var $this = $(this);
    var panoId = $this.data("id");

    // Clear any selected
    $floorPlanHotspotPanoPreviews.removeClass('selected-pano');

    if (FLOOR_PLAN_HOTSPOT_STATE == 1) {
      // Set selected floor plan hotspot
      $this.addClass('selected-pano');
    } else if (FLOOR_PLAN_HOTSPOT_STATE == 2) {
      // Remove selected floor plan hotspot
      removeFloorPlanHotspot(panoId);

      FLOOR_PLAN_HOTSPOT_STATE = 0;
      $floorPlanHotspotPanoPreviews.removeClass("select-pano");
      $floorPlanHotspotPanoPreviews.removeClass("selected-pano");
    }
  });

  $unitFloorPlan.click(function (e) {
    var selectedPano = $floorPlanHotspotPanoPreviews.filter(".selected-pano");
    if (FLOOR_PLAN_HOTSPOT_STATE != 1 || !selectedPano.length) return;

    var $this = $(this);
    var panoId = selectedPano.data("id");
    var pageX = e.pageX;
    var pageY = e.pageY;
    var offset = $this.offset();
    var width = $this.width();
    var height = $this.height();

    var percentX = 100 * (pageX - offset.left) / width;
    var percentY = 100 * (pageY - offset.top) / height;

    updateFloorPlanHotspot(panoId, percentX, percentY);

    FLOOR_PLAN_HOTSPOT_STATE = 0;
    $floorPlanHotspotPanoPreviews.removeClass("select-pano");
    $floorPlanHotspotPanoPreviews.removeClass("selected-pano");
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

    LINK_HOTSPOT_STATE = 1;
    $panoPreviews.addClass('select-pano');
  });

  $removeLinkHotspotButton.click(function (e) {
    e.preventDefault();

    LINK_HOTSPOT_STATE = 2;
    $panoPreviews.addClass('select-pano');
  });

  $setInitialYawButton.click(function (e) {
    e.preventDefault();

    var viewParams = view.parameters();
    var yaw = viewParams["yaw"];

    updateInitialYaw(_currentPano.data["Pano ID"][0], yaw);
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

  var updateFloorPlanHotspot = function(pano_id, percentX, percentY) {
    var label = $unitFloorPlanLabels.filter(".label[data-id='" + pano_id + "']");
    var pano_version_id = _panos[pano_id].data["Record ID"];

    if (label.length <= 0) {
      label = $('<div class="label" data-id="' + pano_id + '"><span>*Refresh*</span></div>')
      $unitFloorPlanLabels.parent().append(label);
    }

    label.css("left", percentX + "%");
    label.css("top", percentY + "%");

    $.ajax({
      type: "POST",
      url: "/admin/floor_plan_hotspot/set",
      data: {
        pano_version_id: pano_version_id,
        percent_x: percentX,
        percent_y: percentY,
      },
      complete: function (xhr, status) {
        if (xhr.status === 200) {
          console.log("Floor Plan Hotspot Updated.");
        }
      },
    });
  };

  var removeFloorPlanHotspot = function(pano_id) {
    $unitFloorPlanLabels.filter(".label[data-id='" + pano_id + "']").remove();
    var pano_version_id = _panos[pano_id].data["Record ID"];

    $.ajax({
      type: "POST",
      url: "/admin/floor_plan_hotspot/remove",
      data: { pano_version_id: pano_version_id },
      complete: function (xhr, status) {
        if (xhr.status === 200) {
          console.log("Floor Plan Hotspot Removed.");
        }
      },
    });
  };

  var updateLinkHotspot = function(pano_id, dest_pano_id, yaw, pitch) {
    var pano_version_id = _panos[pano_id].data["Record ID"];
    var dest_pano_version_id = _panos[dest_pano_id].data["Record ID"];

    $.ajax({
      type: "POST",
      url: "/admin/linked_hotspot/set",
      data: {
        pano_version_id: pano_version_id,
        dest_pano_version_id: dest_pano_version_id,
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

  var removeLinkHotspot = function(pano_id, dest_pano_id) {
    var pano_version_id = _panos[pano_id].data["Record ID"];
    var dest_pano_version_id = _panos[dest_pano_id].data["Record ID"];

    $.ajax({
      type: "POST",
      url: "/admin/linked_hotspot/remove",
      data: {
        pano_version_id: pano_version_id,
        dest_pano_version_id: dest_pano_version_id,
      },
      complete: function (xhr, status) {
        if (xhr.status === 200) {
          console.log("Hotspot Removed.");
        }
      },
    });
  };

  var updateInitialYaw = function(pano_id, yaw) {
    var pano_version_id = _panos[pano_id].data["Record ID"];

    $.ajax({
      type: "POST",
      url: "/admin/pano/initial_yaw/set",
      data: { pano_version_id: pano_version_id, yaw: yaw },
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

    var panoId = _currentPano.data["Pano ID"][0];
    var panoName = _currentPano.data["Pano Name"][0];

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

    if (LINK_HOTSPOT_STATE == 1) {
      var currentPanoId = _currentPano.data["Pano ID"][0];
      var yaw = $setLinkHotspotButton.attr('data-yaw');
      var pitch = $setLinkHotspotButton.attr('data-pitch');

      updateLinkHotspot(currentPanoId, destPanoId, yaw, pitch);

      $panoPreviews.removeClass('select-pano');
      LINK_HOTSPOT_STATE = 0;
    } else if (LINK_HOTSPOT_STATE == 2) {
      var currentPanoId = _currentPano.data["Pano ID"][0];

      // Remove hotspot
      removeLinkHotspot(currentPanoId, destPanoId);

      $panoPreviews.removeClass('select-pano');
      LINK_HOTSPOT_STATE = 0;
    } else {
      switchToPanoId(destPanoId);
    }
  });

  $unitFloorPlanLabels.click(function () {
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

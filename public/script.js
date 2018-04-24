$(document).ready(function () {
  var $fullscreenButton = $(".fullscreen-toggle");
  var panoElement = document.getElementById('pano-window');
  var $panoElement = $('#pano-window');
  var $feedbackToggleButton = $('#pano-window .controls .feedback-toggle');
  var $fullscreenFeedbackContainer = $('#pano-window .fullscreen-feedback');
  var $fullscreenSubmitFeedback = $("#fullscreen-feedback-submit");
  var $fullscreenFeedbackInput = $("#fullscreen-feedback-input");

  var viewerOpts = {
    controls: {
      mouseViewMode: 'drag'    // drag|qtvr
    },
    stage: {
      width: 100,
    }
  };

  var viewer = new Marzipano.Viewer(panoElement, viewerOpts)

  var levels = [
    { width: 4096 },
  ];

  var geometry = new Marzipano.EquirectGeometry(levels);
  var source = Marzipano.ImageUrlSource.fromString(_panoImageURL);
  var limiter = Marzipano.util.compose(
    Marzipano.RectilinearView.limit.vfov(0.698131111111111, 2.09439333333333),
    Marzipano.RectilinearView.limit.hfov(0.698131111111111, 2.09439333333333),
    Marzipano.RectilinearView.limit.pitch(-Math.PI/2, Math.PI/2)
  );
  var view = new Marzipano.RectilinearView({ fov: 2.094 }, limiter);

  var scene = viewer.createScene({
    source: source,
    geometry: geometry,
    view: view
  });

  scene.switchTo();

  $feedbackToggleButton.click(function () {
    if ($fullscreenFeedbackContainer.hasClass("open")) {
      $feedbackToggleButton.text("Give Feedback");
      $fullscreenFeedbackContainer.removeClass("open");
    } else {
      $feedbackToggleButton.text("Hide Feedback");
      $fullscreenFeedbackContainer.addClass("open");
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

  var isRequesting = false;
  var submitFeedback = function (feedbackText) {
    if (isRequesting) return;
    isRequesting = true;
    $fullscreenFeedbackInput.prop("disabled", true);
    $fullscreenFeedbackInput.addClass("disabled");

    $.ajax({
      type: "POST",
      url: "/pano/" + _panoId + "/feedback",
      data: {
        notes: feedbackText,
        viewParameters: JSON.stringify(view.parameters()),
      },
      complete: function (xhr, status) {
        if (xhr.status === 200) {
          $fullscreenFeedbackInput.val("");
          $feedbackToggleButton.text("Give Feedback");
          $fullscreenFeedbackContainer.removeClass("open");
        }

        $fullscreenFeedbackInput.removeClass("disabled");
        $fullscreenFeedbackInput.prop("disabled", false);
        isRequesting = false;
      },
    });
  };

  $fullscreenSubmitFeedback.click(function () {
    var feedbackText = $fullscreenFeedbackInput.val();
    if (!feedbackText.length) return;

    submitFeedback(feedbackText);
  });
});

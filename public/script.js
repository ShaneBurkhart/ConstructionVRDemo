$(document).ready(function () {
  var PROJECT = "Walnut St";
  var BG_LOADING_LIMIT = 1;
  var _bgLoadingQueue = [];
  var _currentBgLoading = [];
  var _bgLoaded = [];

  var _units = {};
  var _panoramaRenderings = {};
  var _vrView = null;
  var $vrView = $('#vr-view');
  var $panoPointsContainer = $('#panorama-points-container');
  var $floorPlan = $('#floor-plan-container .floor-plan');
  var $floorPlanImg = $('#floor-plan-container .floor-plan img');
  var $floorPlanHeader = $('#floor-plan-container .floor-plan-container h2');

  function queueImageLoading(src) {
    if (!src) return;
    // If is loading, is in queue or is loaded, no need to do anything.
    if (_bgLoadingQueue.includes(src) || _currentBgLoading.includes(src) || _bgLoaded.includes(src)) return;

    // If we are already at or above our limit, add to queue.
    if (_currentBgLoading.length >= BG_LOADING_LIMIT) {
      console.log("Queuing: " + src);
      _bgLoadingQueue.push(src);
      return;
    }

    var curImg = new Image();

    curImg.onload = function () {
      console.log("Loaded: " + src);
      if (_bgLoaded.indexOf(src) < 0) _bgLoaded.push(src);

      // Remove src from current loading
      var currentIndex = _currentBgLoading.indexOf(src);
      if (currentIndex > -1) _currentBgLoading.splice(currentIndex, 1);

      // Load up next image
      var nextSrc = _bgLoadingQueue.shift();
      if (nextSrc) queueImageLoading(nextSrc);
    }

    console.log("Kickoff: " + src);
    // Keep track of what's loading
    _currentBgLoading.push(src);
    curImg.src = src;
  }

  function bgLoadPanoramaRenderings(panoramaRenderings) {
    panoramaRenderings = panoramaRenderings || [];

    for(var i = 0; i < panoramaRenderings.length; i++) {
      var rendering = panoramaRenderings[i];
      queueImageLoading(rendering.fields["S3 Image URL"]);
    }
  }

  function showPanoramaRendering(panoramaRendering) {
    if (!panoramaRendering) return;
    var panoramaRenderingEmbedId = panoramaRendering.fields["360 Player Embed ID"];
    //var panoramaRenderingSrc = panoramaRendering.fields["S3 Image URL"];
    //var panoramaRenderingPreview = panoramaRendering.fields["S3 Preview Image URL"];

    $vrView.html([
      "<iframe",
      "src='https://360player.io/p/" + panoramaRenderingEmbedId + "/'",
      "frameborder='0'",
      "width=560",
      "height=315",
      "allowfullscreen",
      "data-token='" + panoramaRenderingEmbedId + "'",
      "></iframe>",
    ].join(" "));
  }

  function getUnitsUrl() {
    var formula = encodeURIComponent('(FIND("' + PROJECT + '", {Project}))');
    return "https://api.airtable.com/v0/appTAmLzyXUW1RxaH/Units?maxRecords=20&view=Walnut%20St&filterByFormula=" + formula;
  }

  function getPanoramaRenderingsUrl(record_ids) {
    var formulaParts = [];
    record_ids = record_ids || [];

    for(var i = 0; i < record_ids.length; i++ ) {
      formulaParts.push('FIND("' + record_ids[i] + '", {Record ID})');
    }

    var formula = 'OR(' + formulaParts.join(',') + ')';
    return "https://api.airtable.com/v0/appTAmLzyXUW1RxaH/Panorama%20Renderings?maxRecords=100&filterByFormula=" + encodeURIComponent(formula);
  }

  function getUnits(done) {
    $.ajax(getUnitsUrl(), {
      accepts: "application/json",
      headers: { "Authorization": "Bearer " + API_KEY }
    }).then(function (results) { done(results.records); });
  }

  function getPanoramaRendering(record_id, done) { getPanoramaRenderings([ record_id ], done); }

  function getPanoramaRenderings(record_ids, done) {
    $.ajax(getPanoramaRenderingsUrl(record_ids), {
      accepts: "application/json",
      headers: { "Authorization": "Bearer " + API_KEY }
    }).then(function (results) { done(results.records); });
  }

  function renderPointsSelect(panoramaRenderings, initValue) {
    var newPoints = [];
    var initPanoramaRendering = null;
    $panoPointsContainer.empty();

    for(var i = 0; i < panoramaRenderings.length; i++) {
      var panoramaRendering = panoramaRenderings[i];
      var prId = panoramaRendering["id"];
      var prName = panoramaRendering.fields["Name"];

      // Find the selected panorama rendering to show the name.
      if (panoramaRendering["id"] === initValue) initPanoramaRendering = panoramaRendering;

      newPoints.push([
        "<div class='pano-point' data-value='" + prId + "'>",
          "<div class='name'>", prName, "</div>",
        "</div>"
      ].join(""));
    }

    $panoPointsContainer.html(newPoints.join(""));
  }

  function showUnit(unit) {
    var fields = unit.fields
    var floorPlanName = fields["Name"];
    var floorPlanURL = fields["S3 Floor Plan URL"];
    var panoramaRenderingIDs = fields["Panorama Renderings"] || [];

    $floorPlanHeader.text("Floor plan for " + floorPlanName);
    $floorPlanImg.attr("src", floorPlanURL);

    var isLoaded = true;
    for(var i = 0; i < panoramaRenderingIDs.length; i++ ) {
      if (!_panoramaRenderings[panoramaRenderingIDs[i]]) {
        isLoaded = false;
        break;
      }
    }

    if (!isLoaded) {
      if (panoramaRenderingIDs.length) {
        getPanoramaRenderings(panoramaRenderingIDs, function (panoramaRenderings) {
          updateStore(_panoramaRenderings, panoramaRenderings);
          var panoramaRendering = panoramaRenderings[0];

          //bgLoadPanoramaRenderings(panoramaRenderings);
          showPanoramaRendering(panoramaRendering);

          renderPointsSelect(panoramaRenderings, panoramaRendering["id"]);
        });
      } else {
        // TODO Show a no renderings found message.
        renderPointsSelect([]);
      }
    } else {
      if (panoramaRenderingIDs.length) {
        // Records already loaded so just show them.
        var panoramaRenderingId = panoramaRenderingIDs[0];
        var panoramaRendering = _panoramaRenderings[panoramaRenderingId];
        var unitPanoramaRenderings = [];

        for(var i = 0; i < panoramaRenderingIDs.length; i++ ) {
          unitPanoramaRenderings.push(_panoramaRenderings[panoramaRenderingIDs[i]]);
        }

        showPanoramaRendering(panoramaRendering);
        renderPointsSelect(unitPanoramaRenderings);
      } else {
        // TODO show a no renderings message.
        renderPointsSelect([]);
      }
    }
  }

  // Indexes newArray by the record id and updates in store.
  function updateStore(store, newArray) {
    for(var i = 0; i < newArray.length; i++) {
      var item = newArray[i];
      store[item["id"]] = item;
    }
  }

  getUnits(function (units) {
    updateStore(_units, units);
    showUnit(units[0]);
  });

  $floorPlan.on("click", ".point", function (e) {
    var $this = $(this);
    var panoramaRenderingId = $this.data("id");
    var panoramaRendering = _panoramaRenderings[panoramaRenderingId];

    showPanoramaRendering(panoramaRendering);
  });

  // Uncomment for placing coordinates of panorama renderings.
  $floorPlanImg.click(function (e) {
    var $this = $(this);
    var offset = $this.offset();
    var clickImgLeft = e.pageX - offset.left;
    var clickImgTop = e.pageY - offset.top;
    var imgWidth = $this.width();
    var imgHeight = $this.height();

    var centerLeft = Math.round(clickImgLeft / imgWidth * 10000) / 100;
    var centerTop = Math.round(clickImgTop / imgHeight * 10000) / 100;
    console.log("Center Left: " + centerLeft + "%");
    console.log("Center Top: " + centerTop + "%");
    console.log(centerLeft + "\t" + centerTop);
  });
});

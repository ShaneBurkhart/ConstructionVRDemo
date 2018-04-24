$(document).ready(function () {
  var panoElement = document.getElementById('pano-window');
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
  var source = Marzipano.ImageUrlSource.fromString("//s3-us-west-2.amazonaws.com/construction-vr/renderings/Walnut+St/44A/example.png");
  var limiter = Marzipano.util.compose(
    Marzipano.RectilinearView.limit.vfov(0.698131111111111, 2.09439333333333),
    Marzipano.RectilinearView.limit.hfov(0.698131111111111, 2.09439333333333),
    Marzipano.RectilinearView.limit.pitch(-Math.PI/2, Math.PI/2)
  );
  var view = new Marzipano.RectilinearView({}, limiter);

  var scene = viewer.createScene({
    source: source,
    geometry: geometry,
    view: view
  });

  scene.switchTo();
});

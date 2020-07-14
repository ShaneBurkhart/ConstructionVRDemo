import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux'
import { Icon, Button, Header, Image, Modal } from 'semantic-ui-react'

import GiveFeedbackSection from './GiveFeedbackSection'

const LEVELS = [
  { width: 512 },
  { width: 4096 },
];

const VIEWER_OPTS = {
  controls: {
    mouseViewMode: 'drag',
  },
  stage: {
    width: 100,
    preserveDrawingBuffer: true,
  }
};

const GEOMETRY = new Marzipano.EquirectGeometry(LEVELS);
const LIMITER = Marzipano.util.compose(
  Marzipano.RectilinearView.limit.vfov(0.698131111111111, 2.09439333333333),
  Marzipano.RectilinearView.limit.hfov(0.698131111111111, 2.09439333333333),
  Marzipano.RectilinearView.limit.pitch(-Math.PI/2, Math.PI/2)
);
const VIEW = new Marzipano.RectilinearView({ fov: 2.094 }, LIMITER);

const createSource = (imageUrl) => {
  return new Marzipano.ImageUrlSource(function (tile) {
    if (tile.z === 0) {
      return { url: imageUrl.replace("\/panos\/", "\/panos-tiny\/") };
    } else {
      return { url: imageUrl };
    }
  });
};

const PanoWindow = ({ pano, admin_mode, setViewer }) => {
  const _viewer = useRef(null);

  const refViewer = ($viewer) => {
    if (_viewer.current) return;
    _viewer.current = new Marzipano.Viewer($viewer, VIEWER_OPTS);
    if (setViewer) setViewer(_viewer.current);
  };

  useEffect(() => {
    // Clean up after removing component
    return () => { if (_viewer.current) _viewer.current.destroy() }
  }, []);

  useEffect(() => {
    // Update scene when on a new pano
    if (!_viewer.current) return;

    const scene = _viewer.current.createScene({
      source: createSource(pano["Image URL"]),
      geometry: GEOMETRY,
      view: VIEW,
    });

    scene.switchTo({ transitionDuration: 300 });
    scene.lookTo({ yaw: pano["Initial Yaw"] || 0, pitch: 0 });
  }, [pano]);

  return (
    <div key="1" id="pano-window" ref={refViewer}>
      {admin_mode && <div className="debug-center-window" />}
    </div>
  );
};

const VirtualTourViewer = (props) => {
  const { panos, admin_mode } = props;
  if (!panos || panos.length == 0) return "";

  const [currentPano, setCurrentPano] = useState(panos[0]);
  const [viewer, setViewer] = useState(null);

  return (
    <div id="virtual-tour">
      <div className="pano-previews">
        {panos.map((p, k) => {
          const panoClass = [
            "pano-preview",
            p == currentPano ? "selected" : "",
          ].join(" ");

          return (
            <div
              key={p["Record ID"]}
              className={panoClass}
              onClick={_=>setCurrentPano(p)}
            >
              <div className="name">{p["Pano Name"]}</div>
            </div>
          );
        })}
      </div>

      <PanoWindow
        admin_mode={admin_mode}
        pano={currentPano}
        setViewer={setViewer}
      />

      {admin_mode &&
        <GiveFeedbackSection
          viewer={viewer}
        />
      }
    </div>
  );
};

export default connect((reduxState, props) => {
  return {
    admin_mode: reduxState.admin_mode,
    panos: reduxState.pano_data,
  };
}, null)(VirtualTourViewer);

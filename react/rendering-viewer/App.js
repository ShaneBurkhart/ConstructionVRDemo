import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
import moment from "moment"
import { Icon, Button, Header, Image, Modal } from 'semantic-ui-react'

import ActionCreators from './action_creators';

import EditDescriptionModal from './EditDescriptionModal'
import VirtualTourViewer from './VirtualTourViewer'
import RenderedImagesViewer from './RenderedImagesViewer'
import RecentFeedback from './RecentFeedback'

const TabMenu = (props) => {
  const { onClick, values, selected } = props;

  const items = Object.keys(values || {}).map(k => {
    const c = ["item", selected == k ? "active" : ""].join(" ");
    return <a key={k} className={c} onClick={e=>onClick(k)}>{values[k]}</a>;
  });

  return <div className="ui tabular menu">{items}</div>;
}

const UnitDescription = ({ description, editable, onClickEdit }) => {
  const details = (description || "").replace(/[\n|]/, " ");

  return (
    <p className="unit-description">
      {details}
      {editable &&
        <a onClick={onClickEdit}>
          &nbsp;{details == "" ? "Add Description" : "Edit Description"}
        </a>
      }
    </p>
  )
};

const App = (props) => {
  const { unit, admin_mode, modals } = props;
  const [selectedView, setSelectedView] = useState("images");

  const onClickEditDescription = () => {
    props.dispatch(ActionCreators.updateModal({ edit_description: true }));
  }

  return (
    <div>
      <h1 className="unit-name">{unit["Name"]}</h1>
      <UnitDescription
        description={unit["Details"]}
        editable={admin_mode}
        onClickEdit={onClickEditDescription}
      />

      <div id="unit-floor-plan">
        <div className="floor-plan-wrapper">
          <img src={unit["Floor Plan Image URL"]} />
        </div>
      </div>

      <h2>Explore the space.</h2>
      <TabMenu
        selected={selectedView}
        values={{
          tour: "Virtual Tour",
          images: "Rendered Images",
        }}
        onClick={setSelectedView}
      />
      {selectedView == "tour" && <VirtualTourViewer />}
      {selectedView == "images" && <RenderedImagesViewer />}

      {admin_mode && <RecentFeedback />}

      <div className="modals">
        {modals.edit_description && <EditDescriptionModal />}
      </div>
    </div>
  );
}

export default connect((reduxState, props) => {
  return {
    admin_mode: reduxState.admin_mode,
    unit: reduxState.unit,
    modals: reduxState.modals,
  };
}, null)(App);


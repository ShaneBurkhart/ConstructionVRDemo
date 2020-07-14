import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
import moment from "moment"
import { Icon, Button, Header, Image, Modal } from 'semantic-ui-react'

import "./RecentFeedback.css"

const Feedback = (props) => {
  const screenshot = (props["Screenshot"] || [])[0];

  return (
    <div className="feedback">
      {screenshot &&
        <a href={screenshot["url"]} className="feedback-image" target="_blank">
          <img src={screenshot["url"]} />
        </a>
      }
      <div>
        <p className="pano_name">{props["Pano Name"] || "Rendered Image"}</p>
        <p className="created_at">{moment(props["Created At"]).fromNow()}</p>
        <div className="show-notes">
          <div className="notes">{props["Notes"]}</div>
        </div>
      </div>
      <div className="break" />
    </div>
  );
}

const RecentFeedback = (props) => {
  const { feedbacks } = props;

  return (
    <div id="feedbacks">
      <h2>Comments</h2>
      {(feedbacks || []).map((f, i) => {
        return <Feedback key={f["Record ID"]} {...(f || {})} />
      })}
    </div>
  );
}

export default connect((reduxState, props) => {
  return {
    admin_mode: reduxState.admin_mode,
    feedbacks: reduxState.feedbacks,
  };
}, null)(RecentFeedback);

import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
import moment from "moment"
import { Icon, Button, Header, Image, Modal } from 'semantic-ui-react'

const Feedback = (props) => {
  const screenshot = (props["Screenshot"] || [])[0];

  return (
    <div className="feedback">
      {screenshot &&
        <a href={screenshot["url"]} className="feedback-image" target="_blank">
          <img src={screenshot["url"]} style={{ width: 300 }} />
        </a>
      }
      <div>
        <p>
          <strong className="pano_name">{props["Pano Name"] || "Rendered Image"}</strong>
          <span className="created_at"> {moment(props["Created At"]).fromNow()}</span>
        </p>
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

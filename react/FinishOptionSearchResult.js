import React from 'react';
import * as _ from 'underscore';
import { connect } from 'react-redux'

import ActionCreators from './action_creators';
import AdminControls from './AdminControls';

import './FinishOption.css';

const showdown = require("showdown");

class FinishOptionSearchResult extends React.Component {
  constructor(props) {
    super(props);

    this.markdownConverter = new showdown.Converter();
  }

  getMarkdownHTML(markdown) {
    const m = (markdown || "").replace(/\n/g, "<br>");
    return this.markdownConverter.makeHtml(m || "");
  }

  onClick = (e) => {
    const { option, onClick } = this.props;
    e.stopPropagation();

    if (onClick) onClick(option);
  }

  render() {
    const { option, short, index } = this.props;
    const optionFields = option;
    const images = (optionFields.Images || []).slice(0, 2);
    const classNames = ["finish-option"];
    if (short) classNames.push("short");

    return (
      <div
        className={classNames.join(" ")}
        onClick={this.onClick}
      >
        <div className="half">
          <p className="cell-heading">{optionFields.name}</p>
          {!!optionFields.unitPrice && <p>Price: ${optionFields.unitPrice}</p>}
          <div
            className="notes"
            dangerouslySetInnerHTML={{ __html: this.getMarkdownHTML(optionFields.info) }}
            />
        </div>
        <div className="half images">
          {images.map((image) => (
            <a key={image["id"]} href={image["url"]} target="_blank">
              <img className={images.length == 1 ? "one" : "two"} src={image["url"]} />
            </a>
          ))}
        </div>
      </div>
    );
  }
}

export default FinishOptionSearchResult;



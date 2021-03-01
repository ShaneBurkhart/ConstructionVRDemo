import React from 'react';
import * as _ from 'underscore';
import { connect } from 'react-redux'
import { Segment, Input, Label, Icon, Button, Popup, Checkbox, Dropdown } from 'semantic-ui-react'

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

  getSafeURL(url) {
    if (!url) return url;
    if (url.startsWith("http")) return url;
    return `http://${url}`;
  }

  onClick = (e) => {
    const { option, onClick } = this.props;
    e.stopPropagation();

    if (onClick) onClick(option);
  }

  render() {
    const { option, short, index } = this.props;
    const images = (option.Images || []).slice(0, 2);
    const classNames = ["finish-option"];
    if (short) classNames.push("short");

    return (
      <div
        className={classNames.join(" ")}
        onClick={this.onClick}
      >
        <div className="half">
          <p className="cell-heading">{option.name}</p>
          {(option.manufacturer || option.itemNum || option.unitPrice || option.style || option.size) &&
            <Popup
              content={
                <div>
                  {option.manufacturer && <p style={{ margin: 0 }}><span className="bold">Manufacturer: </span>{option.manufacturer}</p>}
                  {option.itemNum && <p style={{ margin: 0 }}><span className="bold">Item #: </span>{option.itemNum}</p>}
                  {option.unitPrice && <p style={{ margin: 0 }}><span className="bold">Unit Price: </span>${option.unitPrice}</p>}
                  {option.style && <p style={{ margin: 0 }}><span className="bold">Style/Color: </span>{option.style}</p>}
                  {option.size && <p style={{ margin: 0 }}><span className="bold">Size: </span>{option.size}</p>}
                </div>
              }
              trigger={<a>Option Details</a>}
            />
          }
          <div
            className="notes"
            dangerouslySetInnerHTML={{ __html: this.getMarkdownHTML(option.info) }}
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



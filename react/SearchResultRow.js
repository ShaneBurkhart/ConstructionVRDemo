import React from 'react';

import { Popup } from 'semantic-ui-react'

function SearchResultRow(props) {
  const { option, selection, isSearch, isAdmin, onLinkOptionToSelection } = props;
  const { fields } = option;

  return (
    <div className="ui fluid card option">
      <div className="content">
        <div className="ui grid">
          <div className="eight wide column">
            <Popup
              trigger={
                <p>
                  {fields["Type"]}:&nbsp;
                  <span className="bold">{fields["Name"].slice(0, 25)}</span>
                </p>
              }
              >
              <h4>{fields["Name"]}</h4>
              <p>{fields["Type"]}</p>
              <p>{fields["Unit Price"]}</p>
              <div
                className="notes"
                dangerouslySetInnerHTML={{__html: fields["Info HTML"]}}
                />
            </Popup>
          </div>
          <div className="four wide column">
            {(fields["Image"] || []).map((val, i) => (
              <a key={val["id"]} href={val["url"]} target="_blank">
                <img
                  style={{ maxHeight: 50, maxWidth: 50 }}
                  className={fields["Image"].length == 1 ? "one" : "two" }
                  src={val["url"]}
                  />
              </a>
            ))}
          </div>
          <div className="four wide column">
            <a className="ui" onClick={() => { onLinkOptionToSelection(option.id) }}>
              Link to Selection
            </a>
            <br/>
            <a className="ui" onClick={() => { }}>
              More {fields["Type"]}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchResultRow


import React from 'react';

function SearchResultRow(props) {
  const { option, selection, isSearch, isAdmin, onLinkOptionToSelection } = props;
  const { fields } = option;

  return (
    <div className="ui fluid card option">
      <div className="content">
        <div className="ui grid">
          <div className="eight wide column">
            <p className="bold">{fields["Name"]}</p>
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchResultRow


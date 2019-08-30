import React from 'react';
import OptionCardControls from './OptionCardControls';

function OptionCard(props) {
  const { option, selection, isSearch, isAdmin } = props;
  const { fields } = option;

  return (
    <div className="ui fluid card option">
      <div className="content">
        <div className="ui grid">
          <div className="eight wide column">
            <p className="bold">{fields["Name"]}</p>
            <p>{fields["Unit Price"] || "n/a"}</p>
            <div
              className="notes"
              dangerouslySetInnerHTML={{__html: fields["Info HTML"]}}
              />
          </div>
          <div className="eight wide column">
            {(fields["Image"] || []).map((val, i) => (
              <a key={val["id"]} href={val["url"]} target="_blank">
                <img
                  className={fields["Image"].length == 1 ? "one" : "two" }
                  src={val["url"]}
                  />
              </a>
            ))}
          </div>
        </div>
      </div>
      {isAdmin &&
        <OptionCardControls
          option={option}
          selection={selection}
          isSearch={isSearch}
          isLibrary={fields["Is Library?"]}
          />
      }
    </div>
  );
}

export default OptionCard


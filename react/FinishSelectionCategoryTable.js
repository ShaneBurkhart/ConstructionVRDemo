import React from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import ActionCreators from './action_creators';

const showdown = require("showdown");

class FinishSelectionCategoryTable extends React.Component {
  constructor(props) {
    super(props)

    this.markdownConverter = new showdown.Converter();
  }

  renderSelectionRows() {
    const { selections, options_by_selection_id } = this.props;

    return selections.map((selection, j) => {
      const selectionFields = selection["fields"];
      const options = options_by_selection_id[selection["id"]] || [];
      let rowClasses = ["selection"];
      if (j % 2 == 1) rowClasses.push("shade");

      if (options.length > 0) {
        return options.map((option, i) => {
          const optionFields = option["fields"];
          const images = (optionFields["Image"] || []).slice(0, 2);
          const isFirst = i == 0;

          return (
            <tr className={rowClasses.join(" ")} key={option["id"]}>
              {isFirst &&
                <td rowSpan={Math.max(...[(options || []).length, 1])}>
                  <p className="cell-heading">{selectionFields["Type"]}</p>
                  <p className="cell-details">Location: {selectionFields["Location"]}</p>
                  <p className="cell-details">Niche: {selectionFields["Room"]}</p>
                  <div
                    className="notes"
                    dangerouslySetInnerHTML={{ __html: this.markdownConverter.makeHtml(selectionFields["Notes"] || "") }}
                    />
                </td>
              }
              <td>
                <p className="cell-heading">{optionFields["Name"]}</p>
                {optionFields["Unit Price"] && <p>Price: ${optionFields["Unit Price"]}</p>}
                <div
                  className="notes"
                  dangerouslySetInnerHTML={{ __html: this.markdownConverter.makeHtml(selectionFields["Notes"] || "") }}
                  />
              </td>
              <td>
                {images.map((image) => (
                  <a key={image["id"]} href={image["url"]} target="_blank">
                    <img className={images.length == 1 ? "one" : "two"} src={image["url"]} />
                  </a>
                ))}
              </td>
            </tr>
          )
        })
      } else {
        return (
          <tr className={rowClasses.join(" ")} key={selection["id"]}>
            <td>
              <p className="cell-heading">{selectionFields["Type"]}</p>
              <p className="cell-details">Location: {selectionFields["Location"]}</p>
              <p className="cell-details">Niche: {selectionFields["Room"]}</p>
            </td>
            <td></td>
            <td></td>
          </tr>
        )
      }
    });
  }

  render() {
    const { name } = this.props;

    return (
      <div className="selections-category">
        <h2>{name}</h2>
        <table>
          <thead>
            <tr>
              <th style={{ width: "33%" }}>Selection</th>
              <th style={{ width: "33%" }}>Option Info</th>
              <th style={{ width: "33%" }}>Option Image</th>
            </tr>
          </thead>
          <tbody>
            {this.renderSelectionRows()}
          </tbody>
        </table>
      </div>
    )
  }
}

export default connect(
  (state, props) => ({
    options_by_selection_id: state.options_by_selection_id
  }),
  (dispatch, props) => (bindActionCreators({
  }, dispatch))
)(FinishSelectionCategoryTable);

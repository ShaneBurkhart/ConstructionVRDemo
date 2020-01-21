import React from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import ActionCreators from './action_creators';

import './FinishSelectionCategoryTable.css';

const showdown = require("showdown");

class FinishSelectionCategoryTable extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      expanded: true,
    };

    this.onClickCollapse = this.onClickCollapse.bind(this);
    this.markdownConverter = new showdown.Converter();
  }

  onClickCollapse() {
    const { expanded } = this.state;
    this.setState({ expanded: !expanded });
  }

  getMarkdownHTML(markdown) {
    const m = (markdown || "").replace(/\n/g, "<br>");
    return this.markdownConverter.makeHtml(m || "");
  }

  renderSelectionRows() {
    const { selections, options_by_selection_id } = this.props;

    return selections.map((selection, j) => {
      const selectionFields = selection["fields"];
      const options = options_by_selection_id[selection["id"]] || [];
      let rowClasses = ["selection", j % 2 == 1 ? "shade" : "white"];

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
                    dangerouslySetInnerHTML={{ __html: this.getMarkdownHTML(selectionFields["Notes"]) }}
                    />
                </td>
              }
              <td>
                <div className="finish-option">
                  <div className="half">
                    <p className="cell-heading">{optionFields["Name"]}</p>
                    {optionFields["Unit Price"] && <p>Price: ${optionFields["Unit Price"]}</p>}
                    <div
                      className="notes"
                      dangerouslySetInnerHTML={{ __html: this.getMarkdownHTML(optionFields["Info"]) }}
                      />
                  </div>
                  <div className="half">
                    {images.map((image) => (
                      <a key={image["id"]} href={image["url"]} target="_blank">
                        <img className={images.length == 1 ? "one" : "two"} src={image["url"]} />
                      </a>
                    ))}
                  </div>
                </div>
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
          </tr>
        )
      }
    });
  }

  render() {
    const { name, selections } = this.props;
    const { expanded } = this.state;
    const count = (selections || []).length;

    return (
      <div className="selections-category">
        <h2>
          {name}
          <span className="expand-collapse hide-print">
            <a href="#/" onClick={this.onClickCollapse}>
              {expanded ? "Collapse" : `Expand (${count} selections)` }
            </a>
          </span>
        </h2>
        {expanded &&
          <table>
            <thead>
              <tr>
                <th style={{ width: "33%" }}>Selection</th>
                <th style={{ width: "66%" }}>Options</th>
              </tr>
            </thead>
            <tbody>
              {this.renderSelectionRows()}
            </tbody>
          </table>
        }
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

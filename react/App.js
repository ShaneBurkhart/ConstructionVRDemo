import React from 'react';
import ReactDataSheet from 'react-datasheet';
import $ from 'jquery';

import 'react-datasheet/lib/react-datasheet.css';

const header = [
  { value: "Name", readOnly: true },
  { value: "Type", readOnly: true },
  { value: "Image", readOnly: true },
  { value: "Info", readOnly: true },
  { value: "URL", readOnly: true },
];

const valueRenderer = (cell) => {
  if (cell.type == "images") {
    return (cell.value || []).map(i => i["url"]).join(" ");
  }
  return cell.value;
}

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      finishes: [],
    }
  }

  componentDidMount() {
    $.get("/api/finishes", (data) => {
      this.setState({ finishes: data.finishes });
    });
  }

  generateGrid() {
    const { finishes } = this.state;
    const finishesRows = (finishes || []).map(f => (
      [
        { value: f["fields"]["Name"] },
        { value: f["fields"]["Type"] },
        { type: "images", value: f["fields"]["Image"] },
        { value: f["fields"]["Info"] },
        { value: f["fields"]["URL"] },
      ]
    ));

    return [].concat([header], finishesRows);
  }

  render() {
    return (
      <div className="xlarge-container">
        <ReactDataSheet
            data={this.generateGrid()}
            valueRenderer={valueRenderer}
          />
      </div>
    );
  }
}

export default App;

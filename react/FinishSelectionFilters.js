import React from 'react';

import ActionCreators from './action_creators';

class FinishSelectionFilters extends React.Component {
  createOnClickFilter(f) {
    return () => {
      const { onChange, current } = this.props;
      if (f != current && onChange) onChange(f);
    }
  }

  render() {
    const { current, filters } = this.props;

    return (
      <p className="filters">
        <span>Filter: </span>
        <a
          href="#/"
          onClick={this.createOnClickFilter("All")}
          className={ current == "All" ? "selected" : "" }
          >All</a>
        {filters.map((f) => (
          <span key={f}>
            <span> | </span>
            <a
              href="#/"
              onClick={this.createOnClickFilter(f)}
              className={ current == f ? "selected" : "" }
              >{f}</a>
          </span>
        ))}
      </p>
    )
  }
}

export default FinishSelectionFilters;

import React from 'react';
import { connect } from 'react-redux'

import OptionCard from './OptionCard';

function SelectionRow(props) {
  const { selection, options, index, isAdmin } = props;
  const { fields } = selection;
  const shade = index % 2 == 0 ? "white" : "shade";

  return (
    <tr className={["selection", shade].join(" ")}>
      <td>
        <p className="bold">{fields["Type"]}</p>
        <p>{fields["Location"]} - {fields["Room"]}</p>
        <div
          className="notes"
          dangerouslySetInnerHTML={{__html: fields["Notes HTML"]}}
          />
      </td>
      <td>
        {options.map((value, i) => (
          <OptionCard
            key={value["id"]}
            option={value}
            selection={selection}
            isAdmin={isAdmin}
            />
        ))}
      </td>
    </tr>
  );
}

export default connect(
  (state, props) => {
    var options = (props.selection.fields["Options"] || []).map((value, i) => (
      state.options_by_id[value]
    ));

    return {
      isAdmin: state.is_admin,
      options
    }
  },
  (dispatch) => ({
  })
)(SelectionRow);

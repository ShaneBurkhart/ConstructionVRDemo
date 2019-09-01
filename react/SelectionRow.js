import React from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { Popup, Button } from 'semantic-ui-react'

import ActionCreators from './action_creators';

import OptionCard from './OptionCard';

function SelectionRow(props) {
  const { selection, options, index, isAdmin, onRemoveSelection } = props;
  const { fields } = selection;
  const shade = index % 2 == 0 ? "white" : "shade";

  return (
    <tr className={["selection", shade].join(" ")}>
      <td>
        <p className="bold">{fields["Type"]}</p>
        <p>{fields["Location"]} - {fields["Room"]}</p>
        <p>
          <Popup
            on="click"
            trigger={<a className="ui">Remove Selection</a>}
            content={<Button color="red" onClick={onRemoveSelection}>Are you sure?</Button>}
            />
        </p>
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
  (dispatch, props) => (bindActionCreators({
    onRemoveSelection: () => (ActionCreators.removeSelection(props.selection.id))
  }, dispatch))
)(SelectionRow);

import React from 'react';
import * as _ from 'underscore';
import { Form, Icon, Button, Header, Image, Modal } from 'semantic-ui-react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


import NewFinishOptionPlaceholder from './NewFinishOptionPlaceholder';
import FinishOption from './FinishOption';

class FinishOptionsContainer extends React.Component {
  constructor(props) {
    super(props);
    this._droppableId = Math.random().toString(36).substring(2, 15);
  }

  render() {
    const { options, onSelectOption, draggable, droppableId } = this.props;

    if (draggable) {
      return (
        <Droppable droppableId={droppableId || this._droppableId} type="OPTION">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {options.map((option, i) => (
                <FinishOption
                  draggable={draggable}
                  index={i}
                  key={option["id"]}
                  option={option}
                  onClick={_ => { if (onSelectOption) onSelectOption(option["id"]) }}
                />
              ))}
              {provided.placeholder}
              <NewFinishOptionPlaceholder onClick={_ => { if (onSelectOption) onSelectOption("new") }} />
            </div>
          )}
        </Droppable>
      );
    } else {
      return (
        <div>
          {options.map((option, i) => (
            <FinishOption
              draggable={draggable}
              index={i}
              key={option["id"]}
              option={option}
              onClick={_ => { if (onSelectOption) onSelectOption(option["id"]) }}
            />
          ))}
        {!!onSelectOption && <NewFinishOptionPlaceholder onClick={_ => onSelectOption("new")} />}
        </div>
      );
    }
  }
}

export default FinishOptionsContainer;

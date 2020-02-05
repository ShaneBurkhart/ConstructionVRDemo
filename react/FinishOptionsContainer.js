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
    this._draggableId = Math.random().toString(36).substring(2, 15);
  }

  onNewOption = () => {
    const { onSelectOption } = this.props;
    if (onSelectOption) {
      onSelectOption({
        "id": "new" + Math.random().toString(36).substring(2, 15),
      });
    }
  }

  onLinkOption = () => {
    const { onLinkOption } = this.props;
    if (onLinkOption) onLinkOption();
  }

  render() {
    const { options, onSelectOption, onUnlinkOption, draggable, droppableId,
      getDraggableStyleOverride } = this.props;

    if (draggable) {
      return (
        <div>
          <Droppable droppableId={droppableId || this._droppableId} type="OPTION">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {options.map((option, i) => (
                  <FinishOption
                    draggable={draggable}
                    draggableId={`${this._draggableId}/${option["id"]}`}
                    getDraggableStyleOverride={getDraggableStyleOverride}
                    index={i}
                    key={option["id"]}
                    option={option}
                    onClick={_ => { if (onSelectOption) onSelectOption(option) }}
                    onClickUnlink={_ => { if (onUnlinkOption) onUnlinkOption(option) }}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          <NewFinishOptionPlaceholder
            onClickNew={this.onNewOption}
            onClickLink={this.onLinkOption}
          />
        </div>
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
              onClick={_ => { if (onSelectOption) onSelectOption(option) }}
            />
          ))}
        {!!onSelectOption &&
          <NewFinishOptionPlaceholder
            onClickNew={this.onNewOption}
            onClickLink={this.onLinkOption}
          />
        }
        </div>
      );
    }
  }
}

export default FinishOptionsContainer;

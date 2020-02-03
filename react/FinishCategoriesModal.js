import React from 'react';
import ReactDOM from 'react-dom';
import * as _ from 'underscore';
import { Input, Form, Icon, Button, Select, Header, Image, Modal } from 'semantic-ui-react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import DragDropModal from './DragDropModal';
import AdminControls from './AdminControls';

class FinishCategoriesModal extends DragDropModal {
  constructor(props) {
    super(props);

    this._droppableId = Math.random().toString(36).substring(2, 15);

    this.state = {
      categories: props.categories,
      selectedCategory: props.selectedCategory
    };
  }

  handleCategoryChangeFor = (categoryId) => {
    return (e, data) => {
      const categories = Array.from(this.state.categories || []).map(c => {
        if (c.id != categoryId) return c;

        const newC = _.clone(c);
        newC.fields["Name"] = e.target.value;
        return newC;
      });

      this.setState({ categories });
    }
  }

  onDragEnd = (result) => {
    const { source, destination } = result;
    const { categories } = this.state;
    const newCategories = Array.from(categories);
    if (!destination) return;

    const [removed] = newCategories.splice(source.index, 1);
    newCategories.splice(destination.index, 0, removed);

    this.setState({ categories: newCategories });
  }

  onSave = () => {
    const { onSave } = this.props;
    const { categories } = this.state;
    onSave(categories);
  }

  render() {
    const { onClose } = this.props;
    const { categories, selectedCategory } = this.state;

    return (
      <div {...this.modalsWrapperProps}>
        <div {...this.modalProps}>
          <Modal.Header>
            Manage Categories
            <span style={{ float: "right" }}>
              <Icon name="close" onClick={onClose} />
            </span>
          </Modal.Header>
          <Modal.Content>
            <DragDropContext onDragEnd={this.onDragEnd} >
              <Droppable droppableId={this._droppableId} type="CATEGORY">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {categories.map((c, i) => (
                      <Draggable
                        key={c.id}
                        draggableId={c.id}
                        type="CATEGORY"
                        index={i}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={this.getDraggableStyleOverride(
                              provided.draggableProps["style"],
                              snapshot.isDragging
                            )}
                          >
                            <div style={{ display: "flex" }}>
                              <AdminControls
                                dragHandleProps={provided.dragHandleProps}
                              />
                              <div style={{ width: "100%" }}>
                                <Input
                                  fluid
                                  placeholder="Concepts"
                                  value={c.fields["Name"]}
                                  onChange={this.handleCategoryChangeFor(c.id)}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Modal.Content>
          <Modal.Actions>
              <Button
                negative
                onClick={onClose}
              >Cancel</Button>
              <Button
                positive
                icon='checkmark'
                labelPosition='right'
                content='Save'
                onClick={this.onSave}
              />
          </Modal.Actions>
        </div>
      </div>
    );
  }
}

export default FinishCategoriesModal;

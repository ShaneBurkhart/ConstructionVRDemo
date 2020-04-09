import React from 'react';
import { connect } from 'react-redux'
import { Segment, Icon, Button, Popup } from 'semantic-ui-react'

import "./AdminControls.css"

class AdminControls extends React.Component {
  render() {
    const {
      selectionId, onClickUnlink, onClickTrash, onMoveToCategory,
      dragHandleProps, orderedCategoryIds, categories,
    } = this.props;

    return (
      <div className="admin-controls hide-print" onClick={(e) => e.stopPropagation()}>
        {dragHandleProps &&
          <div {...dragHandleProps}>
            <Icon name="arrows alternate" />
          </div>
        }
        {onClickUnlink &&
          <div onClick={onClickUnlink}>
            <Icon name="unlink" />
          </div>
        }
        {onClickTrash &&
          <Popup
            on="click"
            content={
              <div>
                <p className="bold">Are you sure?</p>
                <Button color="red" onClick={onClickTrash}>Delete</Button>
              </div>
            }
            trigger={
              <div>
                <Icon name="trash" />
              </div>
            }
          />
        }
        {onMoveToCategory &&
          <Popup
            on="click"
            content={
              <div>
                <p className="cell-heading">Move to:</p>
                <Segment vertical style={{
                  maxHeight: 300,
                  overflowY: "scroll",
                  border: "1px solid #e0e0e0",
                  padding: 0
                }}>
                  {orderedCategoryIds.map(id => categories[id]).map(c => (
                    <Segment
                      vertical
                      key={c.id}
                      style={{ padding: 5, cursor: "pointer" }}
                      onClick={_=>onMoveToCategory(c)}
                    >
                      {c.name}
                    </Segment>
                  ))}
                </Segment>
              </div>
            }
            trigger={
              <div>
                <Icon name="arrow left" />
              </div>
            }
          />
        }
      </div>
    );
  }
}

export default connect(
  (reduxState, props) => {
    return {
      categories: reduxState.categories,
      orderedCategoryIds: reduxState.orderedCategoryIds,
    }
  },
  null
)(AdminControls);

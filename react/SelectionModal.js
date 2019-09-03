import React from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import ActionCreators from './action_creators';

import { Select, Button, Header, Image, Modal, Input, Icon } from 'semantic-ui-react'

import EditOptionModal from './EditOptionModal';
import SearchResultRow from './SearchResultRow';

class SelectionModal extends React.Component {
  constructor(props) {
    super(props);

    this.onClickShowMore = this.onClickShowMore.bind(this);
    this.onClickAddFinish = this.onClickAddFinish.bind(this);

    this.state = {
      addNewFinish: false,
      resultsToShow: 30,
    }
  }

  onClickShowMore() {
    this.setState({ resultsToShow: this.state.resultsToShow + 30 });
  }

  onClickAddFinish() {
    this.setState({ addNewFinish: true });
  }

  render() {
    const {
      isAdmin, isLoading, selection, searchResults, closeModal, onChangeSearch, onLinkOptionToSelection
    } = this.props;
    const { resultsToShow, addNewFinish } = this.state;
    const { fields } = selection;

    const { userLibrary, finishVisionLibrary } = searchResults;

    return (
      <Modal open={!!selection}>
        <Modal.Header>
          <div className="pull-right">
            <Button size="small" icon labelPosition="right">
              Filters
              <Icon name="down arrow"/>
            </Button>
            <Input
              icon='search'
              size="mini"
              placeholder='Search...'
              onChange={onChangeSearch}
              />
          </div>
          <h4>Search for a finish to link.</h4>
        </Modal.Header>
        <Modal.Content
          className="scrolling"
          style={{ position: "relative", height: "calc(70vh)"}}
          >
          {userLibrary.slice(0, resultsToShow).map((value, i) => (
            <SearchResultRow
              key={value["id"]}
              option={value}
              selection={selection}
              isAdmin={isAdmin}
              onLinkOptionToSelection={onLinkOptionToSelection}
              />
          ))}

          <a className="ui" onClick={this.onClickShowMore}>Show More</a>

          {isLoading &&
            <div className="ui inverted dimmer active">
              <div className="ui grey header content">Searching...</div>
            </div>
          }
        </Modal.Content>
        <Modal.Actions>
          <p className="pull-left">
            Link to: <span className="bold">{fields["Name"]}</span>
          </p>
          <Button color="green" onClick={this.onClickAddFinish}>Add A Finish To Your Library</Button>
          <Button onClick={closeModal}>Close</Button>
          {addNewFinish &&
            <EditOptionModal option={{ fields: {} }} selection={selection} />
          }
        </Modal.Actions>
      </Modal>
    );
  }
}

export default connect(
  (state, props) => ({
    isAdmin: state.is_admin,
    isLoading: state.isLoading,
    searchResults: state.searchResults,
    selectingForSelection: state.selections_by_id[state.modals.selectingForSelectionId],
  }),
  (dispatch, props) => (bindActionCreators({
    closeModal: () => (ActionCreators.closeSelectionModal()),
    onChangeSearch: (e) => (ActionCreators.searchForOptions(e.target.value)),
    onLinkOptionToSelection: (optionId) => (
      ActionCreators.linkOptionToSelection(optionId, props.selection.id)
    )
  }, dispatch))
)(SelectionModal);

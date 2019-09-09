import React from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import ActionCreators from './action_creators';

import { Popup, Label, Select, Button, Header, Image, Modal, Input, Icon } from 'semantic-ui-react'

import EditOptionModal from './EditOptionModal';
import SearchResultRow from './SearchResultRow';
import SearchThumbnailSection from './SearchThumbnailSection';
import SearchResultsPage from './SearchResultsPage';
import SearchPromoPage from './SearchPromoPage';
import OptionTypeSelect from './OptionTypeSelect';

class SelectionModal extends React.Component {
  constructor(props) {
    super(props);

    this.onClickSearch = this.onClickSearch.bind(this);
    this.onRedirectToSearch = this.onRedirectToSearch.bind(this);

    this.state = {
      searchText: "",
      searchCategory: "",
    }
  }

  onRedirectToSearch(searchText, searchCategory) {
    this.setState({
      searchText: searchText || this.state.searchText,
      searchCategory: searchCategory || this.state.searchCategory
    }, () => { this.onClickSearch(); });
  }

  onClickSearch() {
    this.props.searchForOptions(this.state.searchText, this.state.searchCategory)
  }

  createUpdateHandler(field) {
    return (e) => { this.setState({ [field]: e.target.value || e.target.innerText }) }
  }

  render() {
    const {
      isAdmin, isLoading, isNewFinish, selection, searchResults, promoResults,
      closeModal, onChangeSearch, onLinkOptionToSelection, openAddFinishModal,
    } = this.props;
    const { searchText, searchCategory, addNewFinish } = this.state;
    const { fields } = selection;

    const { query, category, userLibrary, finishVisionLibrary } = searchResults;

    return (
      <Modal open={!!selection}>
        <Modal.Header>
          <div style={{ fontSize: "16px" }} className="pull-right">
            <Input
              action
              type='text'
              value={searchText}
              placeholder='Search...'
              onChange={this.createUpdateHandler("searchText")}
              >
              <OptionTypeSelect
                value={searchCategory}
                emptyText="All Categories"
                onChange={this.createUpdateHandler("searchCategory")}
              />
              <input />
              <Button type='submit' onClick={this.onClickSearch}>Search</Button>
            </Input>
          </div>
          <h4>Link Option</h4>
        </Modal.Header>
        <Modal.Content
          className="scrolling"
          style={{ position: "relative", height: "calc(70vh)"}}
          >
          {(!!query || !!category) &&
            <SearchResultsPage
              isAdmin={isAdmin}
              searchResults={searchResults}
              selection={selection}
              resultsToShow={30}
              onLinkOptionToSelection={onLinkOptionToSelection}
              />
          }

          {!query && !category &&
            <SearchPromoPage
              isAdmin={isAdmin}
              selection={selection}
              groupedOptions={promoResults.byOptionType || {}}
              onRedirectToSearch={this.onRedirectToSearch}
              onLinkOptionToSelection={onLinkOptionToSelection}
              />
          }

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
          <Button color="green" onClick={openAddFinishModal}>Upload Finish Option</Button>
          <Button onClick={closeModal}>Close</Button>
          {isNewFinish &&
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
    isNewFinish: state.modals.editOptionId == -1,
    searchResults: state.searchResults,
    promoResults: state.promoResults,
    selectingForSelection: state.selections_by_id[state.modals.selectingForSelectionId],
  }),
  (dispatch, props) => (bindActionCreators({
    closeModal: ActionCreators.closeSelectionModal,
    searchForOptions: ActionCreators.searchForOptions,
    openAddFinishModal: () => (ActionCreators.openEditOptionModal(-1)),
    onLinkOptionToSelection: (optionId) => (
      ActionCreators.linkOptionToSelection(optionId, props.selection.id)
    )
  }, dispatch))
)(SelectionModal);

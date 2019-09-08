import React from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import ActionCreators from './action_creators';

import { Select, Button, Header, Image, Modal, Input, Icon } from 'semantic-ui-react'

import EditOptionModal from './EditOptionModal';
import SearchResultRow from './SearchResultRow';
import SearchThumbnailSection from './SearchThumbnailSection';
import SearchResultsPage from './SearchResultsPage';
import SearchPromoPage from './SearchPromoPage';
import OptionTypeSelect from './OptionTypeSelect';

class SelectionModal extends React.Component {
  constructor(props) {
    super(props);

    this.onClickAddFinish = this.onClickAddFinish.bind(this);
    this.onChangeSearchText = this.onChangeSearchText.bind(this);
    this.onChangeSearchCategory = this.onChangeSearchCategory.bind(this);
    this.onClickSearch = this.onClickSearch.bind(this);
    this.onRedirectToSearch = this.onRedirectToSearch.bind(this);

    this.state = {
      searchText: "",
      searchCategory: "",
      addNewFinish: false,
    }
  }

  onRedirectToSearch(searchText, searchCategory) {
    this.setState({
      searchText: searchText || this.state.searchText,
      searchCategory: searchCategory || this.state.searchCategory
    });
    this.onClickSearch();
  }

  onClickSearch() {
    this.props.searchForOptions(this.state.searchText, this.state.searchCategory)
  }

  onClickAddFinish() {
    this.setState({ addNewFinish: true });
  }

  onChangeSearchText(e) {
    this.setState({ searchText: e.target.value });
  }

  onChangeSearchCategory(e) {
    this.setState({ searchCategory: e.target.value });
  }

  render() {
    const {
      isAdmin, isLoading, selection, searchResults, promoResults,
      closeModal, onChangeSearch, onLinkOptionToSelection
    } = this.props;
    const { searchText, searchCategory, addNewFinish } = this.state;
    const { fields } = selection;

    const { userLibrary, finishVisionLibrary } = searchResults;

    return (
      <Modal open={!!selection}>
        <Modal.Header>
          <div style={{ fontSize: "16px" }} className="pull-right">
            <Input
              action
              type='text'
              value={searchText}
              placeholder='Search...'
              onChange={this.onChangeSearchText}
              >
              <OptionTypeSelect
                value={searchCategory}
                emptyText="All Categories"
                onChange={this.onChangeSearchCategory}
              />
              <input />
              <Button type='submit'>Search</Button>
            </Input>
          </div>
          <h4>Link Option</h4>
        </Modal.Header>
        <Modal.Content
          className="scrolling"
          style={{ position: "relative", height: "calc(70vh)"}}
          >
          {(!!searchText || !!searchCategory) &&
            <SearchResultsSection
              isAdmin={isAdmin}
              header="Your Library"
              options={userLibrary}
              selection={selection}
              resultsToShow={30}
              onLinkOptionToSelection={onLinkOptionToSelection}
              />
          }

          {!searchText && !searchCategory &&
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

class SearchResultsSection extends React.Component {
  constructor(props) {
    super(props);

    this.onClickShowMore = this.onClickShowMore.bind(this);

    this.state = {
      resultsToShow: props.resultsToShow || 30,
    }
  }

  onClickShowMore() {
    this.setState({ resultsToShow: this.state.resultsToShow + 30 });
  }

  render() {
    const {
      isAdmin, header, options, selection, resultsToShow, onLinkOptionToSelection,
    } = this.props;

    return (
      <div className="search-results-section">
        <h3>{header}</h3>
        {options.slice(0, resultsToShow).map((value, i) => (
          <SearchThumbnailSection
            key={value["id"]}
            option={value}
            selection={selection}
            isAdmin={isAdmin}
            onLinkOptionToSelection={onLinkOptionToSelection}
            />
        ))}

        <a className="ui" onClick={this.onClickShowMore}>Show More</a>
      </div>
    );
  }
}

export default connect(
  (state, props) => ({
    isAdmin: state.is_admin,
    isLoading: state.isLoading,
    searchResults: state.searchResults,
    promoResults: state.promoResults,
    selectingForSelection: state.selections_by_id[state.modals.selectingForSelectionId],
  }),
  (dispatch, props) => (bindActionCreators({
    closeModal: ActionCreators.closeSelectionModal,
    searchForOptions: ActionCreators.searchForOptions,
    onLinkOptionToSelection: (optionId) => (
      ActionCreators.linkOptionToSelection(optionId, props.selection.id)
    )
  }, dispatch))
)(SelectionModal);

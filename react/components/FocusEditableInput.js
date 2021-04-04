import React from 'react';
import { Input, TextArea, Icon } from 'semantic-ui-react';

import { formatPrice } from '../../common/formatters';
import TabContext from '../finishes_revision/contexts/TabContext';
import styles from './FocusEditableInput.module.css';

class FocusEditableInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hovering: false,
      val: props.value || "",
    };
  }

  static contextType = TabContext;

  static defaultProps = {
    type: "",
    oneLine: false,
    error: false,
    isFirstChild: false,
    isLastChild: false,
    onValidate: () => true,
    onCancel: () => {},
    onError: () => {},
    clearError: () => {},
  }

  componentDidUpdate(prevProps){
    if (prevProps.value !== this.props.value) {
      this.setState({ val: this.props.value });
    }
  }

  onMouseEnter = () => {
    this.setState({ hovering: true });
  }

  onMouseLeave = () => {
    this.setState({ hovering: false });
  }

  onClick = (e) => {
    e.stopPropagation();
    const { onOpen, focusKeySig } = this.props;
    const { setFocusedEl } = this.context;
    if (onOpen) onOpen();
    setFocusedEl(focusKeySig);
    this.setState({ hovering: false });
  }
 
  onCancel = () => {
    const { value, onCancel } = this.props;
    const { setFocusedEl } = this.context;
    this.setState({ val: value, hovering: false });
    setFocusedEl(null)
    onCancel();
  };

  onClickCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.onCancel();
  }

  onBlur = () => {
    const { onUpdate, onValidate, onError, clearError } = this.props;
    const { setFocusedEl } = this.context;
    const { val } = this.state;
    if (onValidate && onValidate(val)) {
      clearError();
      setFocusedEl(null);
      this.setState({ hovering: false });
      if (onUpdate) onUpdate(val);
    } else {
      onError && onError();
    }
  }

  onKeyDown = (e) => {
    const { tabToNextEl, tabToPrevEl } = this.context;
    const { isFirstChild, isLastChild } = this.props;
    if (e.shiftKey && e.key === 'Tab'){
      e.preventDefault();
      return tabToPrevEl(isFirstChild);
    } 
    if (e.key === 'Tab') {
      e.preventDefault();
      return tabToNextEl(isLastChild);
    }
  }

  onTextAreaKeyDown = (e) => {
    if (e.key === 'Enter' && e.shiftKey) return //shift+Enter will go to next line, enter will save the form & close
    if (e.key === "Enter") {
      this.onBlur();
    }
    this.onKeyDown(e);
  }

  onKeyUp = (e) => {
    if (e.key === 'Escape') this.onCancel(); // escape btn does not register w/ onkeypress
  }
  
  onKeyPress = (e) => {
    if (e.key === "Enter") this.onBlur();
  }

  onChange = (e) => {
    const { onValidate, clearError } = this.props;
    if (onValidate && onValidate(e.target.value)) clearError();
    this.setState({ val: e.target.value });
  }

  getAnchor = href => (
    <a target="_blank" href={`//${href}`} onClick={e => e.stopPropagation()}>
      {href}
    </a>
  );

  formatTextArea = value => (
    <div>
      {value.split("\n").map((line, i) => (
        <span key={i}>{line} <br /></span>
       ))}
    </div>
  );

  textAreaInput = () => {
    const maxHeight = Math.max(this.state.val.split("\n").length, 3) * 20;
    return (
      <TextArea
        autoFocus
        value={this.state.val}
        onBlur={this.onBlur}
        onChange={this.onChange}
        onKeyDown={this.onTextAreaKeyDown}
        onKeyUp={this.onKeyUp}
        style={{ marginTop: 1, width: '72%', maxHeight }}
        className="slim"
      />
    )
  };

  priceInput = () => (
    <Input
      autoFocus
      size="mini"
      type={"number"}
      step="0.01"
      value={this.state.val}
      error={this.props.error}
      onBlur={this.onBlur}
      onChange={this.onChange}
      onKeyDown={this.onKeyDown}
      onKeyUp={this.onKeyUp}
      onKeyPress={this.onKeyPress}
      className="slim"
    />
  )

  defaultInput = () => (
    <Input
      autoFocus
      size="mini"
      value={this.state.val}
      error={this.props.error}
      onBlur={this.onBlur}
      onChange={this.onChange}
      onKeyDown={this.onKeyDown}
      onKeyUp={this.onKeyUp}
      onKeyPress={this.onKeyPress}
      className="slim"
    />
  );

  getDisplayVal = value => {
    const { type } = this.props;
    if (value && type === 'url') return this.getAnchor(value);
    if (value && type === 'price') return formatPrice(value);
    if (value && type === 'textArea') return this.formatTextArea(value)
    return value;
  }

  renderInputField = () => {
    const { type } = this.props;
    if (type === 'textArea') return this.textAreaInput();
    if (type === 'price') return this.priceInput();
    return this.defaultInput();
  }

  render() {
    const { editable, oneLine, focusKeySig } = this.props;
    const { hovering, val } = this.state;
    const { focusedEl } = this.context;

    if (editable && (focusedEl || []).join("") === (focusKeySig || ['x']).join("")) {
      return (
        <>
          {this.renderInputField()}
          <Icon
            inverted
            circular
            color="green"
            onMouseDown={this.onBlur}
            title="Save Edit"
            name="check"
            style={{ fontSize: 8, margin: 3 }}
          />
          <Icon
            inverted
            circular
            color="grey"
            onMouseDown={this.onClickCancel}
            title="Cancel Edit"
            name="close"
            style={{ fontSize: 8, margin: 3 }}
          />
        </>
      );
    } else {
      return (
        <div
          onClick={this.onClick}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          style={{ minWidth: 60 }}
        >
          <div style={{ display: 'flex' }}>
            <div className={`${oneLine ? styles.oneline : ''} ${styles.displayField}`}>
              {this.getDisplayVal(val)}
            </div>
            {editable && hovering ? (
              <Icon
                title="Edit this field"
                onClick={this.onClick}
                name="pencil alternate"
                style={{ fontSize: 14, minWidth: 14 }}
              />
            ) : <div style={{ minWidth: 14, margin: 1 }} />}
          </div>
        </div>
      );
    }
  }
}

export default FocusEditableInput;

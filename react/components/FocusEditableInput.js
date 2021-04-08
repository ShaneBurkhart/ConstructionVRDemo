import React from 'react';
import { Input, TextArea, Icon } from 'semantic-ui-react';

import { formatPrice } from '../../common/formatters';
import styles from './FocusEditableInput.module.css';

class FocusEditableInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hovering: false,
      focused: props.expanded || false,
      val: props.value || "",
    };
  }

  static defaultProps = {
    type: "",
    oneLine: false,
    error: false,
    expanded: false,
    clearExpanded: () => {},
    handleExpanded: () => {},
    handleTab: () => {},
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


  removeFocus = () => {
    const { expanded, clearExpanded } = this.props;
    if (expanded) clearExpanded();
    this.setState({ focused: false });
  }

  onClick = (e) => {
    e.stopPropagation();
    const { onOpen, handleExpanded } = this.props;
    
    if (onOpen) onOpen();
    
    handleExpanded();
    this.setState({ focused: true });
    this.setState({ hovering: false });
  }
 
  onCancel = () => {
    const { value, onCancel } = this.props;
    this.setState({ val: value, hovering: false });
    this.removeFocus();
    onCancel();
  };

  onClickCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.onCancel();
  }

  onBlur = () => {
    const { onUpdate, onValidate, onError, clearError } = this.props;
    const { val } = this.state;
    if (onValidate && onValidate(val)) {
      clearError();
      this.removeFocus();
      this.setState({ hovering: false });
      if (onUpdate) onUpdate(val);
    } else {
      onError && onError();
    }
  }

  onKeyDown = (e) => {
    const { handleTab, expanded } = this.props;
    if (e.key === 'Tab') {
      e.preventDefault();
      if (!expanded) return this.onBlur();
      handleTab(e);
    }
  }

  onTextAreaKeyDown = (e) => {
    if (e.key === 'Enter' && e.shiftKey) return //shift+Enter will go to next line, Enter will save the form & close
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
    const { editable, oneLine, expanded } = this.props;
    const { hovering, focused, val } = this.state;

    if (editable && (focused || expanded)) {
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

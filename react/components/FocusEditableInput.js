import React from 'react';
import { Input, TextArea, Icon } from 'semantic-ui-react';

import { formatPrice } from '../../common/formatters';
import styles from './FocusEditableInput.module.css';

class FocusEditableInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hovering: false,
      focused: false,
      val: props.value || "",
    };
    this.textInput = React.createRef();
  }

  static defaultProps = {
    type: "",
    oneLine: false,
    // forwardedRef: {},
    isFocusedByLabel: false,
    onValidate: () => true,
    onCancel: () => {},
    onError: () => {},
    clearError: () => {},
  }

  // componentDidMount(){
  //   if (this.props.isFocusedByLabel) this.setState({ focused: true })
  // }

  componentDidUpdate(prevProps){
    const { value, isFocusedByLabel } = this.props;
    if (prevProps.value !== this.props.value) {
      this.setState({ val: this.props.value });
    }
    if (prevProps.isFocusedByLabel !== this.props.isFocusedByLabel ) alert('boomtown')
    
  }

  focusTextInput = () => {
    // Explicitly focus the text input using the raw DOM API
    // Note: we're accessing "current" to get the DOM node
    this.textInput.current.focus();
  }

  onMouseEnter = () => {
    this.setState({ hovering: true });
  }

  onMouseLeave = () => {
    this.setState({ hovering: false });
  }

  onClick = (e) => {
    e.stopPropagation();
    if (this.props.onOpen) this.props.onOpen();
    this.setState({ focused: true, hovering: false });
  }
 
  onCancel = () => {
    this.setState({ val: this.props.value, focused: false, hovering: false });
    this.props.onCancel();
  };

  onClickCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.onCancel();
  }

  onBlur = () => {
    // console.log('onblur')
    const { onUpdate, onValidate, onError, clearError, onClear } = this.props;
    const { val } = this.state;
    if (onValidate && onValidate(val)) {
      clearError();
      this.setState({ focused: false, hovering: false });
      if (onUpdate) onUpdate(val);
    } else {
      onError && onError();
    }
  }

  goToNextInput = () => {
    this.props.goToNextInput();
  }

  onKeyDown = (e) => {
    console.log('keydown', e.key)
    if (e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      this.goToNextInput()
    };
    if (e.key === 'Escape') this.onCancel();
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
    const maxHeight = (this.state.val.split("\n").length || 1) * 25;
    return (
      <TextArea
        autoFocus
        rows={1}
        value={this.state.val}
        onBlur={this.onBlur}
        onChange={this.onChange}
        onKeyDown={this.onKeyDown}
        style={{ marginTop: 1, width: '72%', maxHeight }}
        className="slim"
      />
    )
  };

  priceInput = () => (
    <Input
      autoFocus
      ref={this.textInput}
      size="mini"
      type={"number"}
      step="0.01"
      value={this.state.val}
      error={this.props.error}
      onBlur={this.onBlur}
      onChange={this.onChange}
      onKeyDown={this.onKeyDown}
      className="slim"
    />
  )

  defaultInput = () => (
    <Input
      autoFocus
      // ref={this.props.inputRef}
      size="mini"
      value={this.state.val}
      error={this.props.error}
      onBlur={this.onBlur}
      onChange={this.onChange}
      onKeyDown={this.onKeyDown}
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

  getInputField = () => {
    const { type } = this.props;
    if (type === 'textArea') return this.textAreaInput();
    if (type === 'price') return this.priceInput();
    return this.defaultInput();
  }

  render() {
    const { editable, oneLine, isFocusedByLabel, focusedChild } = this.props;
    const { focused, hovering, val } = this.state;

    let displayField = "";

    // console.log(this.props.inputRef)

    if (editable && (focused)) {
      displayField = (
        <>
          {this.getInputField()}
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
      displayField = (
        <div
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
    return (
      <div
        key="wrapper"
        ref={this.props.inputRef}
        onClick={this.onClick}
        style={{ minWidth: 60 }}
      >
        {displayField}
      </div>
    )
  }
}

export default FocusEditableInput;

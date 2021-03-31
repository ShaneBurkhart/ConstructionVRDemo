import React from 'react';
import { Input, Icon } from 'semantic-ui-react';

import { formatPrice } from '../../common/formatters';
import styles from './FocusEditableInput.module.css'

class FocusEditableInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hovering: false,
      focused: false,
      val: props.value || "",
    };
  }

  static defaultProps = {
    isURL: false,
    isPrice: false,
    oneLine: false,
    onValidate: () => true,
    onCancel: () => {},
    onError: () => {},
    clearError: () => {},
  }

  componentDidUpdate(prevProps){
    if (prevProps.value !== this.props.value) {
      this.setState({ val: this.props.value })
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
    const { onUpdate, onValidate, onError, clearError } = this.props;
    const { val } = this.state;
    if (onValidate && onValidate(val)) {
      clearError();
      this.setState({ focused: false, hovering: false });
      if (onUpdate) onUpdate(val);
    } else {
      onError && onError();
    }
  }

  onKeyPress = (e) => {
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

  getDisplayVal = value => {
    const { isURL, isPrice } = this.props;
    if (value && isURL) return this.getAnchor(value);
    if (value && isPrice) return formatPrice(value);
    return value;
  }

  render() {
    const { editable, error, isPrice, oneLine } = this.props;
    const { focused, hovering, val } = this.state;

    if (editable && focused) {
      return (
        <>
          <Input
            autoFocus
            size="mini"
            type={isPrice ? "number" : "text"}
            step="0.01"
            value={val}
            error={error}
            onBlur={this.onBlur}
            onChange={this.onChange}
            onKeyUp={this.onKeyPress}
            className="slim"
          />
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
            color="grey"
            circular
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

import React from 'react';
import { Input, Icon } from 'semantic-ui-react';

import { formatPrice } from '../../common/formatters';

class FocusEditableInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = { hovering: false, focused: false, val: props.value || "" };
  }

  static defaultProps = {
    link: '',
    isURL: false,
    isPrice: false,
    onValidate: () => true,
    onError: () => {},
    clearError: () => {},
  }

  componentDidUpdate(prevProps){
    if (prevProps.value !== this.props.value){
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
    if (e.key === "Enter") this.onBlur();
  }

  onChange = (e) => {
    const { onValidate, clearError } = this.props;
    if (onValidate && onValidate(e.target.value)) clearError();
    this.setState({ val: e.target.value });
  }

  getDisplayVal = value => {
    const { isURL, link, isPrice } = this.props
    if (value && isURL) return link;
    if (value && isPrice) return formatPrice(value);
    return value;
  }

  render() {
    const { editable, error, isPrice } = this.props;
    const { focused, hovering, val } = this.state;

    if (editable && focused) {
      return (
        <Input
          autoFocus
          size="mini"
          type={isPrice ? "number" : "text"}
          step="0.01"
          value={val}
          error={error}
          onBlur={this.onBlur}
          onChange={this.onChange}
          onKeyPress={this.onKeyPress}
          className="slim"
        />
      );
    } else {
      return (
        <span
          onClick={this.onClick}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          style={{ display: "inline-block", minWidth: 60 }}
        >
          {this.getDisplayVal(val)} &nbsp;
          {editable && hovering && (
            <Icon
              onClick={this.onClick}
              name="pencil alternate"
              style={{ fontSize: 16 }}
            />
          )}
        </span>
      );
    }
  }
}

export default FocusEditableInput;

import React from 'react';
import { Input, Icon } from 'semantic-ui-react'

class FocusEditableInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = { hovering: false, focused: false, value: props.value || "" };
  }

  onMouseEnter = () => {
    this.setState({ hovering: true });
  }

  onMouseLeave = () => {
    this.setState({ hovering: false });
  }

  onClick = (e) => {
    e.stopPropagation();
    this.setState({ focused: true, hovering: false });
  }

  onBlur = () => {
    const { onChange } = this.props;
    const { value } = this.state;
    this.setState({ focused: false, hovering: false });
    if (onChange) onChange(value);
  }

  onKeyPress = (e) => {
    if (event.key === "Enter") this.onBlur();
  }

  onChange = (e) => {
    this.setState({ value: e.target.value });
  }

  render() {
    const { focused, hovering, value } = this.state;

    if (focused) {
      return (
        <Input
          autoFocus
          size="mini"
          value={value}
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
          {value} &nbsp;
          {hovering && <Icon name="pencil alternate" />}
        </span>
      );
    }
  }
}

export default FocusEditableInput;

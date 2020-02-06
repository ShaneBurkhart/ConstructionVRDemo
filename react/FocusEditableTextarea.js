import React from 'react';
import { TextArea, Icon } from 'semantic-ui-react'

class FocusEditableTextarea extends React.Component {
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
    const { unfocusedValue, className } = this.props;
    const { focused, hovering, value } = this.state;

    if (focused) {
      return (
        <div className={className}>
          <TextArea
            autoFocus
            size="mini"
            value={value}
            onBlur={this.onBlur}
            onChange={this.onChange}
            onKeyPress={this.onKeyPress}
            className="slim"
            style={{ display: "block", width: "100%" }}
          />
        </div>
      );
    } else {
      return (
        <div
          onClick={this.onClick}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          {unfocusedValue ?
            (<div
              className={className}
              dangerouslySetInnerHTML={{ __html: unfocusedValue }}
            />) :
            (<div className={className}>
              {value} &nbsp;
            </div>)
          }
          {hovering && <Icon name="pencil alternate" />}
        </div>
      );
    }
  }
}

export default FocusEditableTextarea;

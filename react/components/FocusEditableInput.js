import React from 'react';
import { Input, Icon } from 'semantic-ui-react';

class FocusEditableInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = { hovering: false, focused: false, val: props.value || "" };
  }

  static defaultProps = {
    link: '',
    isURL: false,
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
    const { onUpdate } = this.props;
    const { val } = this.state;
    this.setState({ focused: false, hovering: false });
    if (onUpdate) onUpdate(val);
  }

  onKeyPress = (e) => {
    if (e.key === "Enter") this.onBlur();
  }

  onChange = (e) => {
    this.setState({ val: e.target.value });
  }

  render() {
    const { editable } = this.props;
    const { focused, hovering, val } = this.state;

    if (editable && focused) {
      return (
        <Input
          autoFocus
          size="mini"
          value={val}
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
          {this.props.isURL ? this.props.link : val} &nbsp;
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

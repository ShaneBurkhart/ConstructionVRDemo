import React from 'react';
import * as _ from 'underscore';

class DragDropModal extends React.Component {
  constructor(props) {
    super(props);

    this._scrollTop = 0;
    this._scrollLeft = 0;
    this._modalRef = React.createRef();
    this._modalsWrapperClasses = ["ui", "dimmer", "scrolling", "modals", "page",
      "visible", "active"];
    this._modalClasses = ["ui", "scrolling", "modal", "visible", "active"];

    this.modalsWrapperProps = {
      className: this._modalsWrapperClasses.join(" ")
    }

    this.modalProps = {
      ref: this._modalRef,
      className: this._modalClasses.join(" ")
    }

    this.state = { offsetTop: 0, offsetLeft: 0 }
  }

  componentDidMount() {
    const { offsetLeft, offsetTop } = this.state;
    document.body.classList.add("dimmable", "dimmed", "scrolling");

    const modalDOMNode = (this._modalRef || {}).current;
    if (!modalDOMNode) return;

    const debouncedStateChange = _.debounce(_ => {
      this.setState({
        offsetLeft: modalDOMNode.offsetLeft - this._scrollLeft,
        offsetTop: modalDOMNode.offsetTop - this._scrollTop
      });
    }, 200);

    this._scrollHandler = (e) => {
      this._scrollTop = modalDOMNode.parentElement.scrollTop;
      this._scrollLeft = modalDOMNode.parentElement.scrollLeft;
      debouncedStateChange();
    };

    modalDOMNode.parentElement.addEventListener("scroll", this._scrollHandler);
    this._originalOnWheelHandler = modalDOMNode.parentElement.onwheel;
    modalDOMNode.parentElement.onwheel = this._scrollHandler;
    window.addEventListener("resize", this._scrollHandler);

    this.setState({
      offsetLeft: modalDOMNode.offsetLeft - this._scrollLeft,
      offsetTop: modalDOMNode.offsetTop - this._scrollTop
    });
  }

  componentWillUnmount() {
    const modalDOMNode = (this._modalRef || {}).current;
    if (!modalDOMNode) return;

    modalDOMNode.parentElement.removeEventListener("scroll", this._scrollHandler);
    modalDOMNode.parentElement.onwheel = this._originalOnWheelHandler;
    window.removeEventListener("resize", this._scrollHandler);

    document.body.classList.remove("dimmable", "dimmed", "scrolling");
  }

  onDragStart = () => {
    const { offsetLeft, offsetTop } = this.state;
    const modalDOMNode = (this._modalContainerRef || {}).current;
    if (!modalDOMNode) return;

    if (offsetLeft != modalDOMNode.offsetLeft - this._scrollLeft ||
      offsetTop != modalDOMNode.offsetTop - this._scrollTop) {
      this.setState({
        offsetLeft: modalDOMNode.offsetLeft - this._scrollLeft,
        offsetTop: modalDOMNode.offsetTop - this._scrollTop
      });
    }
  }

  getDraggableOffset = () => {
    const { offsetLeft, offsetTop } = this.state;
    return { offsetLeft, offsetTop };
  }

  getDraggableStyleOverride = (draggableStyle, isDragging) => {
    if (!isDragging) return draggableStyle;
    draggableStyle = draggableStyle || {};

    const { offsetLeft, offsetTop } = this.state;
    const newStyle = _.clone(draggableStyle);

    newStyle["left"] = (draggableStyle["left"] || 0) - (offsetLeft || 0);
    newStyle["top"] = (draggableStyle["top"] || 0) - (offsetTop || 0);

    return newStyle;
  }
}

export default DragDropModal;

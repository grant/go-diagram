/*
 * Button
 * A clickable thing.
 */

import React, { Component } from 'react';

class Button extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const dispatch = this.props.dispatch;
    return (
      <input
        className={`Button`}
        type='button'
        onClick={this.props.onClick.bind(this)}
        value={this.props.value}
        />
    );
  }
}
Button.defaultProps = {
  value: '',
  onClick: ()=>{},
};

export default Button;

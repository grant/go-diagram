/*
 * Button
 * A clickable thing.
 */

import React, { Component } from 'react';

class Button extends Component {
  static get defaultProps() {
    return {
      value: '',
      onClick: ()=>{},
    };
  }

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

export default Button;

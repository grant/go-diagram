/*
 * SearchBox
 * Search for structs, fields, etc.
 */

import React, { Component } from 'react';

class SearchBox extends Component {
  static get defaultProps() {
    return {
      className: '',
      value: '',
      placeholder: 'search...',
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      query: this.props.value || '',
    };
  }

  render() {
    const dispatch = this.props.dispatch;
    return (
      <div className={`SearchBox ${this.props.className}`}>
        <input
          type='text'
          value={this.state.query}
          className='input'
          placeholder={this.props.placeholder}
          onChange={this.changeHandler.bind(this)}
          />
      </div>
    );
  }

  changeHandler(e: Event) {
    e.preventDefault();
    this.setState({...this.state, query: e.target.value});
  }
}

export default SearchBox;

/*
 * SearchBox
 * Search for structs, fields, etc.
 */

import React, { Component } from 'react';

class SearchBox extends Component {
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

  changeHandler(e) {
    e.preventDefault();
    this.setState({...this.state, query: e.target.value});
  }
}
SearchBox.defaultProps = {
  className: '',
  value: '',
  placeholder: 'search...',
}

export default SearchBox;

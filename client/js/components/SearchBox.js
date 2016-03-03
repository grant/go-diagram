/*
 * SearchBox
 * Search for structs, fields, etc.
 */

import React, { Component } from 'react';

class SearchBox extends Component {
  render() {
    const dispatch = this.props.dispatch;
    return (
      <div className='SearchBox'>
        <span>Search...</span>
      </div>
    );
  }
}

export default SearchBox;

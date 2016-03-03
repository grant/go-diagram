/**
 * Struct
 */

import { asyncChangeProjectName, asyncChangeOwnerName } from '../actions/AppActions';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

class Struct extends Component {
  static get defaultProps() {
    return {
      name: '',
      fields: [],
    }
  }

  render() {
    const dispatch = this.props.dispatch;
    let fields = this.props.fields.map(field => {
      return (
        <li className='field'>
          <img src={field.icon} />
          <span className='name'>{field.name}</span>
          <span className='type'>{field.type}</span>
        </li>
      );
    });
    return (
      <div className='struct'>
        <header className='header'>
          <img src='img/struct-icon.png'/>
          {this.props.name}
        </header>
        <ol className='fields'>
          {fields}
        </ol>
      </div>
    );
  }
}

// Wrap the component to inject dispatch and state into it
export default Struct;

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
      let typeClass;
      switch (field.type) {
        case 'string': typeClass = 'string'; break;
        case 'int': typeClass = 'int'; break;
        default: typeClass = 'other'; break;
      }
      return (
        <li className='field'>
          <span className='left'>
            <span className='field icon'>f</span>
            <span className='name'>{field.name}</span>
          </span>
          <span className='right'>
            <span className={['type', typeClass].join(' ')}>{field.type}</span>
          </span>
        </li>
      );
    });
    return (
      <div className='struct'>
        <header className='header'>
          <span className='class icon'>c</span>
          <span className='name'>{this.props.name}</span>
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

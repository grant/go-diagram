/**
 * Struct
 */

import { asyncChangeProjectName, asyncChangeOwnerName } from '../actions/AppActions';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import AutosizeInput from 'react-input-autosize';

// Constants
const HEADER_REF = 'header-ref';
const STRUCT_MIN_WIDTH = 80;

class Struct extends Component {
  static get defaultProps() {
    return {
      name: '',
      fields: [],
    };
  }

  constructor(props) {
    super(props);
    this.state = {...props};
  }

  render() {
    let getInput = (options) => {
      let {
        name,
        ref,
        value,
        onChange,
      } = options;
      value = value || '';
      onChange = onChange || (() => {});
      return (
        <AutosizeInput
          className={name}
          autoComplete='off'
          name={name}
          ref={ref}
          value={value}
          minWidth={STRUCT_MIN_WIDTH}
          onChange={onChange.bind(this)}
          onKeyPress={(e) => {
            // Blur on Enter
            if (e.which == 13) {
              this.refs[ref].blur();
            }
          }}
        />
      );
    };

    let fields = this.state.fields.map((field, i) => {
      let typeClass;
      if (field.type.includes('string')) {
        typeClass = 'string';
      } else if (field.type.includes('int')) {
        typeClass = 'int';
      } else if (field.type.includes('bool')) {
        typeClass = 'bool';
      } else {
        typeClass = 'other';
      }
      return (
        <li key={i} className='field'>
          <span className='left'>
            <span className='field icon'>f</span>
            {getInput({
              name: 'name',
              ref: 'field-' + i,
              value: field.name,
              onChange: this.onFieldNameChange.bind(this, i),
            })}
          </span>
          <span className='right'>
            {getInput({
              name: ['type', typeClass].join(' '),
              ref: 'type-' + i,
              value: field.type,
              onChange: this.onFieldTypeChange.bind(this, i),
            })}
          </span>
        </li>
      );
    });

    return (
      <div className='Struct'>
        <header className='header' onClick={this.onHeaderClick.bind(this)}>
          <span className='class icon'>c</span>
          {getInput({
            name: 'name',
            ref: HEADER_REF,
            value: this.state.name,
            onChange: this.onNameChange,
          })}
        </header>
        <ol className='fields'>
          {fields}
        </ol>
      </div>
    );
  }

  onFieldTypeChange(key, e) {
    let newFields = this.state.fields.slice(0);
    newFields[key].type = e.target.value;
    this.setState({
      ...this.state,
      field: newFields,
    });
  }

  onFieldNameChange(key, e) {
    let newFields = this.state.fields.slice(0);
    newFields[key].name = e.target.value;
    this.setState({
      ...this.state,
      field: newFields,
    });
  }

  onHeaderClick() {
    this.refs[HEADER_REF].select()
  }

  onNameChange(e) {
    this.setState({
      ...this.state,
      name: e.target.value,
    });
  }
}

// Wrap the component to inject dispatch and state into it
export default Struct;

/**
 * Struct
 */

import React, { Component } from 'react';
import { Link } from 'react-router';
import AutosizeInput from 'react-input-autosize';

// Constants
const HEADER_REF = 'header-ref';
const FIELD_NAME_PREFIX = 'name-';
const FIELD_TYPE_PREFIX = 'type-';
const STRUCT_MIN_WIDTH = 120;

const noop = () => {
};

class Struct extends Component {
  static get defaultProps() {
    return {
      package: '',
      file: '',
      name: '',
      fields: [],
      //onDelete: noop,
      //onNameChange: noop,
      //onFieldTypeChange: noop,
      //onFieldNameChange: noop,
      //onRemoveField: noop,
      //onAddField: noop,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      name: props.name,
      fields: props.fields,
    };
  }

  render() {
    let getInput = (options) => {
      let {
        name,
        ref,
        value,
        onChange,
        onBlur,
        } = options;
      value = value || '';
      onChange = onChange || noop;
      onBlur = onBlur || noop;
      return (
        <AutosizeInput
          className={name}
          autoComplete='off'
          name={name}
          ref={ref}
          value={value}
          minWidth={STRUCT_MIN_WIDTH}
          onBlur={onBlur.bind(this)}
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
      const TYPES = ['string', 'int', 'bool'];
      let typeClass = TYPES.indexOf(field.type.struct) !== -1 ? field.type.struct : 'other';
      return (
        <li key={i} className='field'>
          <span className='left'>
            <span className='field icon' onClick={this.onRemoveField.bind(this, i)}>
              <span className='f'>f</span>
              <span className='x'>x</span>
            </span>
            {getInput({
              name: 'name',
              ref: FIELD_NAME_PREFIX + i,
              value: field.name,
              onChange: this.onFieldNameChange.bind(this, i),
              onBlur: this.onFieldNameBlur.bind(this, i),
            })}
          </span>
          <span className='right'>
            {getInput({
              name: ['type', typeClass].join(' '),
              ref: FIELD_TYPE_PREFIX + i,
              value: field.type.literal,
              onChange: this.onFieldTypeChange.bind(this, i),
              onBlur: this.onFieldTypeBlur.bind(this, i),
            })}
          </span>
        </li>
      );
    });

    return (
      <div className='Struct'>
        <header className='header'>
          <span className='class icon' onClick={::this.onAddField}>
            <span className='c'>c</span>
            <span className='p'>+</span>
          </span>
          {getInput({
            name: 'name',
            ref: HEADER_REF,
            value: this.state.name,
            onChange: this.onNameChange,
            onBlur: this.onNameBlur,
          })}
          <span className='delete icon' onClick={::this.onDelete}>x</span>
        </header>
        <ol className='fields'>
          {fields}
        </ol>
      </div>
    );
  }

  onFieldTypeChange(key:Number, e:Event) {
    let newFields = this.state.fields.slice(0);
    newFields[key].type.literal = e.target.value;
    this.setState({
      ...this.state,
      fields: newFields,
    });
  }

  onFieldTypeBlur(key:Number, e:Event) {
    this.props.onFieldTypeChange({
      package: this.props.package,
      file: this.props.file,
      name: this.props.name,
      key,
      newFieldType: e.target.value,
    });
  }

  onFieldNameChange(key:Number, e:Event) {
    let newFields = this.state.fields.slice(0);
    newFields[key].name = e.target.value;
    this.setState({
      ...this.state,
      fields: newFields,
    });
  }

  onFieldNameBlur(key:Number, e:Event) {
    this.props.onFieldNameChange({
      package: this.props.package,
      file: this.props.file,
      name: this.props.name,
      key,
      newFieldName: e.target.value,
    });
  }

  onRemoveField(key:Number, e:Event) {
    this.props.onRemoveField({
      package: this.props.package,
      file: this.props.file,
      name: this.props.name,
      key,
    });
  }

  onAddField(e:Event) {
    this.refs[HEADER_REF].blur()
    this.props.onAddField({
      package: this.props.package,
      file: this.props.file,
      name: this.props.name,
    });
  }

  onHeaderClick() {
    this.refs[HEADER_REF].select()
  }

  onDelete() {
    this.props.onDelete({
      package: this.props.package,
      file: this.props.file,
      name: this.props.name,
    });
  }

  onNameChange(e) {
    this.setState({
      ...this.state,
      name: e.target.value,
    });
  }

  onNameBlur(e) {
    this.props.onNameChange({
      package: this.props.package,
      file: this.props.file,
      name: this.props.name,
      newName: e.target.value,
    });
  }
}

// Wrap the component to inject dispatch and state into it
export default Struct;

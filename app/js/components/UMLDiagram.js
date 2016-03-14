/*
 * UMLDiagram
 * This contains the whole UML diagram
 */

import React, { Component } from 'react';
import Struct from './Struct';
import * as appActions from '../actions/AppActions';
import { connect } from 'react-redux';

// Helper
// Gets the closest element that has class `classname`. Returns null if doesn't exist.
let distFromParent = (element, classname) => {
  let searchClass = element.className || '';
  if (searchClass.split(' ').indexOf(classname) >= 0) return 0;
  if (element.parentNode) {
    let dist = distFromParent(element.parentNode, classname);
    if (dist !== null) {
      return 1 + dist;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

class UMLDiagram extends Component {
  static get defaultProps() {
    return {
      actions: {},
      data: null,
      miniMap: false,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      dragging: false,
      dragOrigin: null,
      clickStart: null,
      selection: {
        pkg: null,
        file: null,
        struct: null,
      },
      position: {
        x: 0,
        y: 0,
      },
      data: props.data || {
        packages: [
          // files: [
          // name: string
          // structs: [
          // name: string
          // fields: [
          // name: string
          // type: string
          // ]
          // ]
          // ]
        ],
      },
    };
  }

  render() {
    let {x, y} = this.state.position;
    var transformList = [`translate(${x}px, ${y}px)`];
    if (this.props.miniMap) {
      transformList.push('scale(0.3)');
    }
    const transform = {
      transform: transformList.join(' ')
    };

    // Create the package innards
    let selection = this.state.selection;
    let packages = this.state.data.packages.map(pkg => {
      return (
        <section
          ref={pkg.name}
          key={pkg.name}
          className={['package', (selection.pkg === pkg.name) ? 'selected' : ''].join(' ')}
          onClick={this.onPackageClick.bind(this, pkg)}
        >
          <h3 className='title'>{pkg.name}</h3>
          {pkg.files.map(file => {
            return (
              <div
                ref={pkg.name + '/' + file.name}
                key={file.name}
                className={['file', (selection.file === file.name) ? 'selected' : ''].join(' ')}
                onClick={this.onFileClick.bind(this, {
                  pkg: pkg,
                  file: file,
                })}
              >
                <h3 className='title'>{file.name}</h3>
                {file.structs.map(struct => {
                  return (
                    <Struct
                      ref={pkg.name + '/' + file.name + '/' + struct.name}
                      key={struct.name}
                      package={pkg.name}
                      file={file.name}
                      onDelete={this.props.actions.deleteStruct}
                      onNameChange={this.props.actions.changeStructName}
                      onFieldTypeChange={this.props.actions.changeStructFieldType}
                      onFieldNameChange={this.props.actions.changeStructFieldName}
                      onAddField={this.props.actions.addStructField}
                      onRemoveField={this.props.actions.removeStructField}
                      name={struct.name}
                      fields={struct.fields}
                    />
                  );
                })}
              </div>
            );
          })}
        </section>
      );
    });

    return (
      <div
        className={`UMLDiagram ${this.state.dragging ? 'dragging' : ''}`}
        onMouseDown={this.onMouseDown.bind(this)}
        onMouseUp={this.onMouseUp.bind(this)}
        onMouseLeave={this.onMouseLeave.bind(this)}
        onMouseMove={this.onMouseMove.bind(this)}
        onClick={this.deselect.bind(this)}
      >
        <div
          className='diagram'
          style={transform}
        >
          {!!packages ? packages : ''}
        </div>
      </div>
    );
  }

  startDrag(e) {
    let {pageX, pageY} = e;
    let {x, y} = this.state.position;
    this.setState({
      ...this.state,
      dragging: true,
      clickStart: +new Date,
      dragOrigin: {
        x: pageX - x,
        y: pageY - y,
      }
    });
  }

  stopDrag(e) {
    this.setState({...this.state, dragging: false});
  }

  deselect(e) {
    if (distFromParent(e.target, 'package') === null &&
      distFromParent(e.target, 'file') === null) {
      this.setState({
        ...this.state,
        selection: {
          pkg: null,
          file: null,
          struct: null,
        }
      });
    }
  }

  selectPackage(pkg) {
    this.setState({
      ...this.state,
      selection: {
        pkg: pkg.name,
        file: null,
        struct: null,
      }
    });
  }

  selectFile(path) {
    this.setState({
      ...this.state,
      selection: {
        pkg: path.pkg.name,
        file: path.file.name,
        struct: null,
      }
    });
  }

  onPackageClick(pkg, e) {
    // TODO Make a finer filter (don't include child clicks from structs)
    if (distFromParent(e.target, 'package') !== null && distFromParent(e.target, 'file') === null) {
      // select package
      this.selectPackage(pkg)
    }
  }

  onFileClick(path, e) {
    // TODO Make a finer filter (don't include child clicks from structs)
    if (distFromParent(e.target, 'file') < distFromParent(e.target, 'package')) {
      // select file
      this.selectFile(path)
    }
  }

  // Events
  onMouseDown(e) {
    this.startDrag(e)
  }

  onMouseLeave(e) {
    this.stopDrag(e)
  }

  onMouseUp(e) {
    this.stopDrag(e)
  }

  onMouseMove(e) {
    if (this.state.dragging) {
      // update position
      let {pageX, pageY} = e;
      let dragOrigin = this.state.dragOrigin;
      this.setState({
        ...this.state,
        position: {
          x: pageX - dragOrigin.x,
          y: pageY - dragOrigin.y,
        },
      });
    }
  }
}

// Wrap the component to inject dispatch and state into it
export default UMLDiagram;

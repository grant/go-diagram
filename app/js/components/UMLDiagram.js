/*
 * UMLDiagram
 * This contains the whole UML diagram
 */

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Struct from './Struct';
import * as appActions from '../actions/AppActions';
import { connect } from 'react-redux';
import Button from './Button';
import $ from 'jquery';

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
      // {
      // packages: [
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
      // }
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

    // Ref helpers
    let getPackageRef = (pkg) => pkg.name;
    let getFileRef = (pkg, file) => getPackageRef(pkg) + '/' + file.name;
    let getStructRef = (pkg, file, struct) => getPackageRef(pkg) + '/' + getFileRef(pkg, file) + '/' + struct.name;

    // Create the package innards
    let selection = this.state.selection;
    let packages = this.props.data.packages.map(pkg => {
      return (
        <section
          ref={getPackageRef(pkg)}
          key={pkg.name}
          className={['package', (selection.pkg === pkg.name) ? 'selected' : ''].join(' ')}
          onClick={this.onPackageClick.bind(this, pkg)}
        >
          <h3 className='title'>{pkg.name}</h3>
          {pkg.files.map(file => {
            //ref={getFileRef(pkg, file)}
            return (
              <div
                ref={getFileRef(pkg, file)}
                key={file.name}
                className={['file', (selection.file === file.name) ? 'selected' : ''].join(' ')}
                onClick={this.onFileClick.bind(this, {
                  pkg: pkg,
                  file: file,
                })}
              >
                <h3 className='title'>{file.name}</h3>
                <Button
                  className='addStruct'
                  value='+'
                  onClick={this.addStruct.bind(this, {
                    package: pkg.name,
                    file: file.name,
                  })}
                />
                {file.structs.map(struct => {
                  return (
                    <Struct
                      className={getStructRef(pkg, file, struct)}
                      ref={getStructRef(pkg, file, struct)}
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

    let getXY = (fieldOrStruct) => {

      //if (!fieldTypeName) {
      //  // struct
      //} else {
      //  // field
      //}
      let pkg = {
        name: fieldOrStruct.packageName
      };
      let file = {
        name: fieldOrStruct.fileName
      };
      let struct = {
        name: fieldOrStruct.structName
      };
      let fieldType = {
        name: fieldOrStruct.fieldTypeName
      };
      let structRef = this.refs[getStructRef(pkg, file, struct)];
      let structNode = ReactDOM.findDOMNode(structRef);
      let $structNode = $(structNode);
      let structNodeOffset = $structNode.offset();

      if (!$structNode.offset()) {
        console.log('ERROR BAD EDGE DATA', getStructRef(pkg, file, struct), structRef);
        return null;
      }

      return {
        x: structNodeOffset.left - this.state.position.x,
        y: structNodeOffset.top - this.state.position.y,
      };
    };

    const edgeClass = 'edgeline';
    let edges = (() => {
      // Setup line xy fix once structs are aligned correctly
      setInterval(() => {
        // Fning React doesn't support svg markerWidth/markerHeight/orient etc. Caps needed!
        let marker = document.getElementsByTagName('marker')[0];
        if (marker) {
          marker.setAttribute("markerWidth", "10");
          marker.setAttribute("markerHeight", "10");
          marker.setAttribute("orient", "auto");
          marker.setAttribute("refX", "0");
          marker.setAttribute("refY", "2");
          marker.setAttribute("markerUnits", "strokeWidth");
        }

        // SUPER HACK, passes data through ref
        let edges = [];
        for (let ref in this.refs) {
          if (ref.startsWith('edge:')) {
            edges.push({
              ref,
              data: JSON.parse(ref.split('edge:')[1]),
            });
          }
        }

        // Go through each edge ref and update xy
        for (let {ref, data: {from, to}} of edges) {
          let start = getXY(from);
          let end = getXY(to);
          if (!start || !end) {
            continue; // Anwell made a edge data mistake
          }

          const curviness = 100;
          let anchorX = (end.x - start.x) / 2;
          let anchorY = (end.y - start.y) / 2 - curviness;
          if (start.x === end.x) {
            // Make left curve if line is vertical
            anchorX -= curviness;
            anchorY += curviness;
          }
          $(this.refs[ref]).attr({
            d: `M ${start.x} ${start.y} q ${anchorX} ${anchorY} ${end.x - start.x} ${end.y - start.y}`
          });
        }
      }, 300);

      // TODO Make svg size less hacky
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="10000px" height="10000px">
          <defs>
            <marker id="head">
              <path d="M0,0 L0,4 L6,2 z" />
            </marker>
          </defs>
          {this.props.data.edges.map(edge => {
            // Render
            // x1={startXY.x}
            // y1={startXY.y}
            // x2={endXY.x}
            // y2={endXY.y}
            let edgeRef = 'edge:' + JSON.stringify(edge);
            return (
              <path
                ref={edgeRef}
                className={edgeClass}
                data-edgedata={JSON.stringify(edge)}
                markerEnd='url(#head)'
                stroke="black"
                fill="none"
                opacity="0.5"
                strokeWidth="3"/>
            );
          })}
        </svg>
      );
    })();

    return (
      <div
        className={`UMLDiagram ${this.state.dragging ? 'dragging' : ''}`}
        onMouseDown={this.onMouseDown.bind(this)}
        onMouseUp={this.onMouseUp.bind(this)}
        onMouseLeave={this.onMouseLeave.bind(this)}
        onMouseMove={this.onMouseMove.bind(this)}
        onTouchStart={this.onMouseDown.bind(this)}
        onTouchEnd={this.onMouseUp.bind(this)}
        onTouchMove={this.onMouseMove.bind(this)}
        onClick={this.deselect.bind(this)}
      >
        <div
          className='diagram'
          style={transform}
        >
          <section className='packages'>{packages ? packages : ''}</section>
          <section className='edges'>{edges ? edges : ''}</section>
        </div>
      </div>
    );
  }

  startDrag(e) {
    let {pageX, pageY} = e;
    if (!pageX && !pageY) {
      // Support touch
      e.preventDefault()
      pageX = e.touches[0].pageX;
      pageY = e.touches[0].pageY;
    }
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

  addStruct(file) {
    this.props.actions.onAddStruct(file);
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
      if (!pageX && !pageY) {
        // Support touch
        e.preventDefault()
        pageX = e.touches[0].pageX;
        pageY = e.touches[0].pageY;
      }
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

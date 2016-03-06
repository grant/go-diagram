
/*
 * UMLDiagram
 * This contains the whole UML diagram
 */

import React, { Component } from 'react';
import Struct from './Struct';

class UMLDiagram extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dragging: false,
      dragOrigin: null,
      position: {
        x: 0,
        y: 0,
      },
      data: props.data || {
        packages: [
          // files: [
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
    let packages = this.state.data.packages.map(pkg => {
      return (
        <section key={pkg.name} className='package'>
          {pkg.files.map(file => {
            return (
              <div key={file.name} className='file'>
                {file.structs.map(struct => {
                  return (
                    <Struct
                      key={struct.name}
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
      dragOrigin: {
        x: pageX - x,
        y: pageY - y,
      }
    });
  }

  stopDrag(e) {
    this.setState({...this.state, dragging: false});
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
UMLDiagram.defaultProps = {
  data: null,
  miniMap: false,
};

// Wrap the component to inject dispatch and state into it
export default UMLDiagram;

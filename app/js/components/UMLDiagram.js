
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
    };
  }

  render() {
    let {x, y} = this.state.position;
    const transform = {
      transform: `translate(${x}px, ${y}px)`
    };

    let packages = [];
    let files = [];
    let structs = [(
      <Struct
        name='Op'
        fields={[{
          name: 'OpType',
          type: 'string',
        }, {
          name: 'ServerId',
          type: 'int',
        }, {
          name: 'Px',
          type: '*Paxos',
        }]}
      />
    ), (
      <Struct
        name='Paxos'
        fields={[{
          name: 'me',
          type: 'int',
        }, {
          name: 'dead',
          type: 'bool',
        }, {
          name: 'unreliable',
          type: 'bool',
        }, {
          name: 'rpcCount',
          type: 'int',
        }, {
          name: 'peers',
          type: '[]string',
        }]}
      />
    )];

    files[0] = (
      <div className='file'>
        {structs}
      </div>
    );

    packages[0] = (
      <section className='package'>
        {files}
      </section>
    );

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
          {packages}
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

// Wrap the component to inject dispatch and state into it
export default UMLDiagram;

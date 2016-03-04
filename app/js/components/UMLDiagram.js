
/*
 * UMLDiagram
 * This contains the whole UML diagram
 */

import React, { Component } from 'react';
import Struct from './Struct';

class UMLDiagram extends Component {
  render() {
    const dispatch = this.props.dispatch;
    return (
      <div className='UMLDiagram'>
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
      </div>
    );
  }
}

// Wrap the component to inject dispatch and state into it
export default UMLDiagram;

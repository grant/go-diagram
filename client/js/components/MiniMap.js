/*
 * MiniMap
 * Shows a small map of the UML Diagram. Includes navigation buttons.
 */

import React, { Component } from 'react';

class MiniMap extends Component {
  render() {
    const dispatch = this.props.dispatch;
    return (
      <div className='MiniMap'>
        <div className='buttons'>
          <button>struct</button>
          <button>file</button>
          <button>package</button>
        </div>
        <div className='map'></div>
      </div>
    );
  }
}

export default MiniMap;

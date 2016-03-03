/**
 *
 * App.react.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import Logo from '../../img/logo.png';
import Struct from './Struct';

class App extends Component {
  render() {
    return (
      <div className="wrapper">
        <Struct name='food' />
        <img className="logo" src={Logo} />
        { this.props.children }
      </div>
    );
  }
}

// REDUX STUFF

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(App);

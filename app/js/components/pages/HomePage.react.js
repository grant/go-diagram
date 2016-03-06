/*
 * HomePage
 * This is the first thing users see of our App
 */

import { asyncChangeProjectName, asyncChangeOwnerName } from '../../actions/AppActions';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Struct from '../Struct';
import UMLDiagram from '../UMLDiagram';
import SearchBox from '../SearchBox';
import MiniMap from '../MiniMap';
import Button from '../Button';

class HomePage extends Component {
  render() {
    const dispatch = this.props.dispatch;
    const {projectName, ownerName} = this.props.data;

    let packageData = {
      packages: [{
        name: 'mainpkg',
        files: [{
          name: 'mainfile.go',
          structs: [{
            name: 'Op',
            fields: [{
              name: 'OpType',
              type: 'string',
            }, {
              name: 'ServerId',
              type: 'int',
            }, {
              name: 'Px',
              type: '*Paxos',
            }],
          }, {
            name: 'Paxos',
            fields: [{
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
            }],
          }],
        }],
      }],
    };

    return (
      <div className='HomePage'>
        <SearchBox
          className='current-directory'
          value='~/cse404/'
          placeholder='project directory...'
          />
        <UMLDiagram
          data={packageData}
        />
        <SearchBox className='search' />
        <div className='bottom-right'>
          <Button
            value='+'
            onClick={this.addStruct.bind(this)}
          />
          <MiniMap
            data={packageData}
          />
        </div>
        <h1>Hello Anwell and Grant!</h1>
        <h2>This is the demo for the <span className="home__text--red">{ projectName }</span> by <a href={'https://twitter.com/' + ownerName} >@{ ownerName }</a></h2>
        <label className="home__label">Change to your project name:
          <input className="home__input" type="text" onChange={(evt) => { dispatch(asyncChangeProjectName(evt.target.value)); }} defaultValue="React.js Boilerplate" value={projectName} />
        </label>
        <label className="home__label">Change to your name:
          <input className="home__input" type="text" onChange={(evt) => { dispatch(asyncChangeOwnerName(evt.target.value)); }} defaultValue="mxstbr" value={ownerName} />
        </label>
        <Link className="btn" to="/readme">Setup</Link>
      </div>
    );
  }

  addStruct() {
    console.log('add struct');
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
export default connect(select)(HomePage);

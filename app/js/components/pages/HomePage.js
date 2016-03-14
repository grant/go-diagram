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
import * as AppActions from '../../actions/AppActions';
import { bindActionCreators } from 'redux';

class HomePage extends Component {
  static get defaultProps() {
    return {
      actions: {},
      data: null,
    };
  }

  render() {
    const dispatch = this.props.dispatch;
    const {
      projectName,
      ownerName,
      packageData,
      } = this.props.data;

    return (
      <div className='HomePage'>
        <SearchBox
          className='current-directory'
          value='~/cse404/'
          placeholder='project directory...'
          />
        <UMLDiagram
          actions={this.props.actions}
          data={packageData}
        />
        <SearchBox className='search' />
        <div className='bottom-right'>
          <Button
            value='+'
            onClick={HomePage.addStruct.bind(this)}
          />
          <MiniMap
            data={packageData}
          />
        </div>
        <h1>Hello Anwell and Grant!</h1>
        <h2>This is the demo for the <span className="home__text--red">{ projectName }</span> by <a href={'https://twitter.com/' + ownerName} >@{ ownerName }</a></h2>
        <label className="home__label">Change to your project name:
          <input className="home__input" type="text" onChange={(evt) => { this.props.actions.asyncChangeProjectName(evt.target.value); }} defaultValue="React.js Boilerplate" value={projectName} />
        </label>
        <label className="home__label">Change to your name:
          <input className="home__input" type="text" onChange={(evt) => { this.props.actions.asyncChangeOwnerName(evt.target.value); }} defaultValue="mxstbr" value={ownerName} />
        </label>
        <Link className="btn" to="/readme">Setup</Link>
      </div>
    );
  }

  static addStruct() {
    console.log('add struct');
  }
}

function mapStateToProps(state) {
  return {
    data: state
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(AppActions, dispatch)
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(HomePage);

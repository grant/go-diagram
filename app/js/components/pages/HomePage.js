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
import Connection from '../../utils/Connection';

class HomePage extends Component {
  static get defaultProps() {
    return {
      actions: {},
      data: {},
    };
  }

  constructor(props) {
    super(props);
    this.setUpConnection();
  }

  setUpConnection() {
    Connection.setUp();
    Connection.onMessage(({data: packageData}) => {
      this.props.actions.setPackageData(packageData);
    });
  }

  render() {
    const {
      projectName,
      ownerName,
      packageData,
      } = this.props.data;

    return (
      <div className='HomePage'>
        {/*<SearchBox
         className='current-directory'
         value='~/cse404/'
         placeholder='project directory...'
         />*/}
        <UMLDiagram
          actions={this.props.actions}
          data={packageData}
        />
        {/*<SearchBox className='search' />*/}
        <div className='bottom-right'>
          {/*<MiniMap
           data={packageData}
           />*/}
        </div>
      </div>
    );
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

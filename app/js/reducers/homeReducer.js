/*
 * The reducer takes care of our data
 * Using actions, we can change our application state
 * To add a new action, add it to the switch statement in the homeReducer function
 *
 * Example:
 * case YOUR_ACTION_CONSTANT:
 *   return assign({}, state, {
 *       stateVariable: action.var
 *   });
 *
 * To add a new reducer, add a file like this to the reducers folder, and
 * add it in the rootReducer.js.
 */
import * as AppConstants from '../constants/AppConstants';
import assignToEmpty from '../utils/assign';
import _ from 'underscore';

const initialState = {
  projectName: 'React.js Boilerplate',
  ownerName: 'mxstbr',
  packageData: {
    packages: [{
      name: 'mainpkg',
      files: [{
        name: 'mainfile.go',
        structs: [{
          // name: 'Op',
          name: 'Opawaoiegiowegjwegioowjegiow egiowe gweig ',
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
  }
};

function homeReducer(state = initialState, action) {
  Object.freeze(state); // Don't mutate state directly, always use assign()!
  switch (action.type) {
    case AppConstants.CHANGE_OWNER_NAME:
      return assignToEmpty(state, {
        ownerName: action.name
      });
    case AppConstants.CHANGE_PROJECT_NAME:
      return assignToEmpty(state, {
        projectName: action.name
      });
    case AppConstants.DELETE_STRUCT:
      let deletingStruct = action.struct;

      let packages = state.packageData.packages;
      let packageIndex = _.findIndex(packages, (pkg) => pkg.name === deletingStruct.package);
      let files = packages[packageIndex].files;
      let fileIndex = _.findIndex(files, (file) => file.name === deletingStruct.file);
      let structs = files[fileIndex].structs;
      let structIndex = _.findIndex(structs, (fileStructs) => fileStructs.name === deletingStruct.name);

      let newState = assignToEmpty(state, {});
      newState.packageData.packages[packageIndex].files[fileIndex].structs.splice(structIndex, 1);
      return newState;
    default:
      return state;
  }
}

export default homeReducer;

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

function clone(state) {
  return assignToEmpty(state, {});
}

function getStructData(state, struct) {
  let packages = state.packageData.packages;
  let packageIndex = _.findIndex(packages, (pkg) => pkg.name === struct.package);
  let files = packages[packageIndex].files;
  let fileIndex = _.findIndex(files, (file) => file.name === struct.file);
  let structs = files[fileIndex].structs;
  let structIndex = _.findIndex(structs, (fileStructs) => fileStructs.name === struct.name);
  return {
    packageIndex,
    fileIndex,
    structIndex,
  };
}

function homeReducer(state = initialState, action) {
  Object.freeze(state); // Don't mutate state directly, always use assign()!
  const handler = {
    [AppConstants.CHANGE_OWNER_NAME]: () => {
      return assignToEmpty(state, {
        ownerName: action.name
      });
    },
    [AppConstants.CHANGE_PROJECT_NAME]: () => {
      return assignToEmpty(state, {
        projectName: action.name
      });
    },
    [AppConstants.DELETE_STRUCT]: () => {
      let struct = getStructData(state, action.struct);
      let newState = clone(state);
      newState.packageData.packages[struct.packageIndex].files[struct.fileIndex].structs.splice(struct.structIndex, 1);
      return newState;
    },
    [AppConstants.CHANGE_STRUCT_NAME]: () => {
      let struct = getStructData(state, action.struct);
      let newState = clone(state);
      let newStruct = newState.packageData.packages[struct.packageIndex].files[struct.fileIndex].structs[struct.structIndex];
      newStruct.name = action.struct.newName;
      newState.packageData.packages[struct.packageIndex].files[struct.fileIndex].structs[struct.structIndex] = newStruct;
      return newState;
    },
    [AppConstants.CHANGE_STRUCT_FIELD_NAME]: () => {
      let struct = getStructData(state, action.struct);
      let newState = clone(state);
      let newField = newState.packageData.packages[struct.packageIndex].files[struct.fileIndex].structs[struct.structIndex].fields[action.struct.key];
      newField.name = action.struct.newFieldName;
      newState.packageData.packages[struct.packageIndex].files[struct.fileIndex].structs[struct.structIndex].fields[action.struct.key] = newField;
      return newState;
    },
    [AppConstants.CHANGE_STRUCT_FIELD_TYPE]: () => {
      let struct = getStructData(state, action.struct);
      let newState = clone(state);
      let newField = newState.packageData.packages[struct.packageIndex].files[struct.fileIndex].structs[struct.structIndex].fields[action.struct.key];
      newField.type = action.struct.newFieldType;
      newState.packageData.packages[struct.packageIndex].files[struct.fileIndex].structs[struct.structIndex].fields[action.struct.key] = newField;
      return newState;
    },
    [AppConstants.ADD_STRUCT_FIELD]: () => {
      let struct = getStructData(state, action.struct);
      let newState = clone(state);
      newState.packageData.packages[struct.packageIndex].files[struct.fileIndex].structs[struct.structIndex].fields.push({
        name: '[name]',
        type: '[type]',
      });
      return newState;
    },
    [AppConstants.REMOVE_STRUCT_FIELD]: () => {
      let struct = getStructData(state, action.struct);
      let newState = clone(state);
      newState.packageData.packages[struct.packageIndex].files[struct.fileIndex].structs[struct.structIndex].fields.splice(action.struct.key, 1);
      return newState;
    },
  }[action.type];

  //{
  //  name: 'name',
  //    type: 'type',
  //}

  if (handler) {
    console.log(action);
    return handler();
  } else {
    console.log('Default event handler: ', action.type);
    return state;
  }
}

export default homeReducer;

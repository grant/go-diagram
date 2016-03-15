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
import Connection from '../utils/Connection';

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
          name: 'Something',
          fields: [{
            name: 'OpType',
            type: {
              literal: 'string',
              structs: ['string'],
            },
          }, {
            name: 'ServerId',
            type: {
              literal: 'int',
              structs: ['int'],
            },
          }, {
            name: 'Px',
            type: {
              literal: '*Paxos',
              structs: ['Paxos']
            },
          }],
        }, {
          name: 'Paxos',
          fields: [{
            name: 'me',
            type: {
              literal: 'int',
              structs: ['int'],
            },
          }, {
            name: 'dead',
            type: {
              literal: 'bool',
              structs: ['bool'],
            },
          }, {
            name: 'unreliable',
            type: {
              literal: 'bool',
              structs: ['bool'],
            },
          }, {
            name: 'rpcCount',
            type: {
              literal: 'int',
              structs: ['int']
            },
          }, {
            name: 'peers',
            type: {
              literal: '[]string',
              structs: ['string']
            },
          }],
        }],
      }],
    }],
    edges: [{
      from: {
        fieldTypeName: "Px",
        fileName: "mainfile.go",
        packageName: "mainpkg",
        structName: "Something",
      },
      to: {
        fieldTypeName: "",
        fileName: "mainfile.go",
        packageName: "mainpkg",
        structName: "Paxos",
      },
    }]
  }
};

function clone(state) {
  return assignToEmpty(state, {});
}

function getFileData(state, file) {
  let packages = state.packageData.packages;
  let packageIndex = _.findIndex(packages, (pkg) => pkg.name === file.package);
  let files = packages[packageIndex].files;
  let fileIndex = _.findIndex(files, (f) => f.name === file.file);
  return {
    packageIndex,
    fileIndex,
  };
}

function getStructData(state, struct) {
  let {
    packageIndex,
    fileIndex,
    } = getFileData(state, struct);
  let structs = state.packageData.packages[packageIndex].files[fileIndex].structs;
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
      newField.type.literal = action.struct.newFieldType;
      newState.packageData.packages[struct.packageIndex].files[struct.fileIndex].structs[struct.structIndex].fields[action.struct.key] = newField;
      return newState;
    },
    [AppConstants.ADD_STRUCT_FIELD]: () => {
      let struct = getStructData(state, action.struct);
      let newState = clone(state);
      newState.packageData.packages[struct.packageIndex].files[struct.fileIndex].structs[struct.structIndex].fields.push({
        name: '[name]',
        type: {
          literal: '[type]',
          structs: [],
        },
      });
      return newState;
    },
    [AppConstants.REMOVE_STRUCT_FIELD]: () => {
      let struct = getStructData(state, action.struct);
      let newState = clone(state);
      newState.packageData.packages[struct.packageIndex].files[struct.fileIndex].structs[struct.structIndex].fields.splice(action.struct.key, 1);
      return newState;
    },
    [AppConstants.SET_PACKAGE_DATA]: () => {
      let newState = clone(state);
      newState.packageData = JSON.parse(action.packageData);
      return newState;
    },
    [AppConstants.ADD_STRUCT]: () => {
      let newState = clone(state);
      let file = getFileData(state, action.file);
      newState.packageData.packages[file.packageIndex].files[file.fileIndex].structs.push({
        name: '[name]',
        fields: [],
      });
      return newState;
    },
  }[action.type];


  if (handler) {
    // 1. Process the action
    let newState = handler();
    // 2. Send the action
    Connection.sendMessage(newState.packageData);
    // 3. Render the new state
    return newState;
  } else {
    console.log('Default event handler: ', action.type);
    return state;
  }
}

export default homeReducer;

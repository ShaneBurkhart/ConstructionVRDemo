import $ from 'jquery';
import Actions from '../../common/actions'
import _  from 'underscore'

const ActionCreator = {
  load: (data) => {
    return {
      action: Actions.LOAD,
      data,
    }
  },

  updateModal: (modals) => {
    return { type: Actions.UPDATE_MODAL, modals };
  },

  updateUnit: (unit) => {
    return { type: Actions.UPDATE_UNIT, unit };
  },
};

export default ActionCreator;

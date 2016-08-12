import { createLogic } from 'redux-logic';

import { NOTIFY_CREATE, NOTIFY_REMOVE, NOTIFY_QUEUE,
         NOTIFY_DISPLAY_QUEUED,
         notifyQueue, notifyRemove, notifyDisplayQueued
       } from './actions';

import { selectors as notifySel } from './reducer';

export const MAX_DISPLAY = 3;
export const DISPLAY_TIME = 3000;

export const notifyCreateLogic = createLogic({
  type: NOTIFY_CREATE,

  // check to see if it is valid to start, > 0
  validate({ getState, action }, allow, reject) {
    const state = getState();
    const current = notifySel.messages(state);
    const queue = notifySel.queue(state);
    if (current.length < MAX_DISPLAY && !queue.length) {
      allow(action);
    } else {
      reject(notifyQueue(action.payload));
    }
  },

  process({ action }, dispatch) {
    const msg = action.payload;
    setTimeout(() => {
      dispatch(notifyRemove([msg]));
    }, DISPLAY_TIME);
  }
});

export const notifyRemoveLogic = createLogic({
  type: NOTIFY_REMOVE,

  process({ getState, action }, dispatch) {
    // unless other middleware/logic introduces async behavior, the
    // state will have been updated by the reducers before process runs
    const state = getState();
    const queue = notifySel.queue(state);
    if (queue.length) {
      dispatch(notifyDisplayQueued());
    } else { // nothing to do
      //tell process we're done with empty dispatch
      dispatch();
    }
  }
});

export const notifyQueuedLogic = createLogic({
  type: NOTIFY_QUEUE,

  process({ getState }, dispatch) {
    // just in case things had already cleared out,
    // check to see if can display yet, normally
    // any remove actions trigger this check but if already
    // empty we will queue one up for good measure
    setTimeout(() => {
      const state = getState();
      const current = notifySel.messages(state);
      if (!current.length) {
        dispatch(notifyDisplayQueued());
      } else { // the next remove will trigger display
        dispatch(); // nothing to dispatch, but tell process we are done
      }
    }, 100);
  }
});

export const notifyDisplayQueuedLogic = createLogic({
  type: NOTIFY_DISPLAY_QUEUED,
  validate({ getState, action }, allow, reject) {
    const state = getState();
    const current = notifySel.messages(state);
    const queue = notifySel.queue(state);
    const needed = MAX_DISPLAY - current.length;
    if (needed > 0 && queue.length) {
      allow({
        ...action,
        payload: queue.slice(0, needed)
      });
    } else {
      reject(); // preventing msg from continuing
    }
  },

  process({ action }, dispatch) {
    const arrMsgs = action.payload;
    setTimeout(() => {
      dispatch(notifyRemove(arrMsgs));
    }, DISPLAY_TIME);
  }
});

export default [
  notifyCreateLogic,
  notifyRemoveLogic,
  notifyQueuedLogic,
  notifyDisplayQueuedLogic
];
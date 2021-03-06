import zulip from 'zulip-js';
import {
  SIGN_IN,
  UPDATE_STREAMS,
  UPDATE_MESSAGES,
  UPDATE_USERS,
  UPDATE_POINTER,
  UPDATE_CURRENT_MESSAGE,
  UPDATE_SUBSCRIPTIONS,
} from '../constants';

export function addReaction(message_id, emoji_name, emoji_code) {
  return (dispatch, getState) => {
    const { config } = getState();
    return zulip(config)
      .then(z => z.reactions.add({ message_id, emoji_name, emoji_code }))
      .then(({ result }) => {
        if (result === 'success') {
          fetchMessages(message_id, 0, 0)(dispatch, getState);
        }
      });
  };
}

export function removeReaction(message_id, emoji_name, emoji_code) {
  return (dispatch, getState) => {
    const { config } = getState();
    return zulip(config)
      .then(z => z.reactions.remove({ message_id, emoji_name, emoji_code }))
      .then(({ result }) => {
        if (result === 'success') {
          fetchMessages(message_id, 0, 0)(dispatch, getState);
        }
      });
  };
}

export function updateCurrentMessage(message) {
  return (dispatch) => {
    dispatch({
      type: UPDATE_CURRENT_MESSAGE,
      message,
    });
  };
}

export function markAsRead(messages) {
  return (dispatch, getState) => {
    const { config } = getState();
    const flag = 'read';
    return zulip(config)
      .then(z => z.messages.flags.add({ flag, messages }));
  };
}

export function updatePointer(id) {
  return (dispatch, getState) => {
    const { config } = getState();
    return zulip(config)
      .then(z => z.users.me.pointer.update(id))
      .then(({ result }) => {
        if (result === 'success') {
          dispatch({
            type: UPDATE_POINTER,
            pointer: id,
          });
        }
      });
  };
}

export function fetchPointer(dispatch, config) {
  return zulip(config)
    .then(z => z.users.me.pointer.retrieve())
    .then(({ pointer}) => {
      dispatch({
        type: UPDATE_POINTER,
        pointer,
      });
      return pointer;
    });
}

export function fetchSubscriptions(redirect) {
  return (dispatch, getState) => {
    const { config } = getState();
    return zulip(config)
      .then(z => z.streams.subscriptions.retrieve())
      .then(({ subscriptions }) => {
        dispatch({
          type: UPDATE_SUBSCRIPTIONS,
          subscriptions,
        });
        if (redirect) redirect();
      });
  };
}

export function fetchStreams(redirect) {
  return (dispatch, getState) => {
    const { config } = getState();
    return zulip(config)
      .then(z => z.streams.retrieve())
      .then((res) => {
        dispatch({
          type: UPDATE_STREAMS,
          streams: res.streams,
        });
        if (redirect) redirect();
      });
  };
}

export function fetchMessages(anchor, num_before = 10, num_after = 20) {
  return (dispatch, getState) => {
    const { config, messages } = getState();
    const params = {
      num_before,
      num_after,
      anchor,
    };
    if (!anchor) {
      const lastMessage = messages[messages.length - 1];
      params.num_before = 0;
      params.anchor = lastMessage.id;
    }
    return zulip(config)
      .then(z => z.messages.retrieve(params))
      .then((res) => {
        dispatch({
          type: UPDATE_MESSAGES,
          messages: res.messages,
        });
      });
  };
}

export function fetchUsers(redirect) {
  return (dispatch, getState) => {
    const { config } = getState();
    return zulip(config)
      .then(z => z.users.retrieve({}))
      .then((res) => {
        const users = [].concat(res.members);
        dispatch({
          type: UPDATE_USERS,
          users,
        });
        if (redirect) redirect();
      });
  };
}

export function fetchEvent(queueID, lastEventID = -1, waitTime = 1000) {
  return (dispatch, config) => {
    const params = {
      queue_id: queueID,
      last_event_id: lastEventID,
      dont_block: false,
    };

    setTimeout(() => {
      zulip(config)
      .then(z => z.events.retrieve(params))
      .then(({ events }) => {
        const messages = events.filter(e => e.type === "message").map(e => e.message);
        const lastEventID = events[events.length - 1].id;
        dispatch({
          type: UPDATE_MESSAGES,
          messages,
        });
        fetchEvent(queueID, lastEventID, 10000)(dispatch, config);
      }).catch(() => {
        fetchEvent(queueID, lastEventID, waitTime * 2)(dispatch, config);
      })
    }, waitTime);
  };
}

export function registerQueue(eventTypes = ['message'], waitTime = 1000) {
  return (dispatch, config) => {
    const params = {
      event_types: eventTypes,
      apply_markdown: true,
    };
    return zulip(config)
      .then(z => z.queues.register(params))
      .then(({ queue_id }) => {
        fetchEvent(queue_id)(dispatch, config);
      }).catch(() => {
        setTimeout(() => {
          registerQueue(eventTypes, waitTime * 2)(dispatch, config);
        }, waitTime);
      });
  };
}

export function signin(configWithPassword, redirect) {
  return (dispatch, getState) => {
    zulip(configWithPassword).then(({ config }) => {
      dispatch({
        type: SIGN_IN,
        config,
      });
      registerQueue()(dispatch, config);
      fetchPointer(dispatch, config).then((pointer) => {
        fetchMessages(pointer)(dispatch, getState);
      });
      fetchSubscriptions()(dispatch, getState);
      fetchStreams()(dispatch, getState);
      fetchUsers()(dispatch, getState);
      if (redirect) redirect();
    });
  };
}

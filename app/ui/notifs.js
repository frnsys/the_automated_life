import ReactDOM from 'react-dom';
import React, { useRef, useState, useEffect } from 'react';
import { animated, useTransition } from 'react-spring';

let id = 0;
const defaultTimeout = 5000;

const history = [];

function Notifications({ config = { tension: 125, friction: 20, precision: 0.1 }, timeout = defaultTimeout, children }) {
  const [refMap] = useState(() => new WeakMap())
  const [cancelMap] = useState(() => new WeakMap())
  const [items, setItems] = useState([])
  const transitions = useTransition(items, item => item.key, {
    from: { opacity: 0, height: 0 },
    enter: item => async next => await next({ opacity: 1, height: refMap.get(item).offsetHeight }),
    leave: item => async (next, cancel) => {
      cancelMap.set(item, cancel)
      await next({ opacity: 0 })
      await next({ height: 0 })
    },
    onRest: item => setItems(state => state.filter(i => i.key !== item.key)),
    config: (item, state) => (state === 'leave' ? [{ duration: timeout }, config, config] : config),
  })

  useEffect(() => void children((title, msg, style={}) => {
    history.unshift({title, msg, style});
    setItems(state => [...state, { key: id++, title, msg, style }])
  }), [])
  return (
    <div className='notification-container'>
      {transitions.map(({ key, item, props: { ...style } }) => (
        <div className='notification-message' key={key}>
          <div className='notification-content' ref={ref => ref && refMap.set(item, ref)} style={item.style}>
            <div>
              <div className='notification-title'>{item.title}</div>
              {item.msg ? <div className='notification-body'>{item.msg}</div> : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export {
  Notifications, history
};

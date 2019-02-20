import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import store from './app/store';
import logic from './app/logic';
import App from './app/ui/app';

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('main'));

// Game loop
let lastTime = 0;
function loop(now) {
  let elapsed = now - lastTime; // ms

  // Countdown robots to deepening automation
  store.dispatch({
    type: 'robot:countdown',
    payload: elapsed
  });

  // Check for deepening automation
  let {robots} = store.getState();
  Object.values(robots).filter((r) => !r.deepened && r.countdown <= 0).forEach((r) => {
    logic.deepeningAutomation(r);
    store.dispatch({
      type: 'robot:deepened',
      payload: r.id
    });
  });

  // TODO Note that this will trigger re-renders;
  // we need to be careful about re-rendering every frame
  // as this will slow things down, e.g. notifications
  // TESTING earn money
  // store.dispatch({
  //   type: 'player:income'
  // });
  lastTime = now;
  requestAnimationFrame(loop);
}
loop();

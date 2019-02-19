import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import store from './app/store';
import App from './app/ui/app';

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('main'));

// Game loop
function loop() {
  // TODO Note that this will trigger re-renders;
  // we need to be careful about re-rendering every frame
  // as this will slow things down, e.g. notifications
  // TESTING earn money
  // store.dispatch({
  //   type: 'player:income'
  // });
  requestAnimationFrame(loop);
}
loop();

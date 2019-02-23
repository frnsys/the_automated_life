import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import config from 'config';
import store from './app/store';
import logic from './app/logic';
import util from './app/util';
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
  let {player, robots, time} = store.getState();

  if (!isNaN(elapsed)) {
    store.dispatch({
      type: 'time',
      payload: elapsed
    });

    // Check if new month
    let {month} = util.timeToDate(time);
    let newDate = util.timeToDate(time + elapsed);
    if (month !== newDate.month) {
      // TODO Note that this will trigger re-renders;
      // we need to be careful about re-rendering every frame
      // as this will slow things down, e.g. notifications
      // TESTING earn money
      store.dispatch({
        type: 'player:income'
      });
      store.dispatch({
        type: 'player:expenses'
      });

      if (player.job.name == 'Student') {
        store.dispatch({
          type: 'player:learn'
        });
        if (player.schoolCountdown <= 0) {
          store.dispatch({
            type: 'player:graduate'
          });
        }
      }

      // Check game end state
      if (player.startAge + newDate.years >= config.retirementAge) {
        if (player.cash >= config.retirementSavingsMin) {
          alert('game over, you win');
        } else {
          alert('game over, you lose');
        }
      }
    }
  }

  store.dispatch({
    type: 'player:slack'
  });

  // Countdown robots to deepening automation
  store.dispatch({
    type: 'robot:countdown',
    payload: elapsed
  });

  // Check for deepening automation
  Object.values(robots).filter((r) => !r.deepened && r.countdown <= 0).forEach((r) => {
    logic.deepeningAutomation(r);
    store.dispatch({
      type: 'robot:deepened',
      payload: r.id
    });
  });

  lastTime = now;
  requestAnimationFrame(loop);
}
loop();

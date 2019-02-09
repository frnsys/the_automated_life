import React, {Component} from 'react';
import {render} from 'react-dom';
import Player from './app/player';
import Jobs from './app/job';

class App extends Component {
  render() {
    return <div>hello world</div>;
  }
}

const main = document.getElementById('main');
render(<App />, main);

// Game setup
const player = new Player();
// Random job for now
player.job = Jobs[10];

console.log(player.job.similar);

// Game loop
function loop() {
  console.log('tick');
  requestAnimationFrame(loop);
}
loop();

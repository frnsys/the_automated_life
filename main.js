import React, {Component} from 'react';
import {render} from 'react-dom';
import Skills from './app/skill.js';

console.log(Skills);

class App extends Component {
  render() {
    return <div>hello world</div>;
  }
}

let main = document.getElementById('main');
render(<App />, main);

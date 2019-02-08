import React, {Component} from 'react';
import {render} from 'react-dom';

class App extends Component {
  render() {
    return <div>hello world</div>;
  }
}

let main = document.getElementById('main');
render(<App />, main);

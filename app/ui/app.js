import React from 'react';
import Scene from './scene';
import HUD from './hud';
import Work from './work';
import School from './school';
import Notifications from './notifs';
import { GlobalStyle } from './styles'

const App = () => {
  // Kind of hacky way to make notifications accessible globally
  return (
    <div>
      <GlobalStyle />
      <Notifications children={add => (window.notify = add)} />

      <HUD />

      <Scene />

      <Work />
      <School />
    </div>
  );
}

export default App;

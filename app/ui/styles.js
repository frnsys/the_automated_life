import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Arimo:400,400i,700,700i');

  html,
  body {
    margin: 0;
    padding: 0;
    font-family: 'Arimo', 'Helvetiva', sans-serif;
  }

  .tooltip h5, .tooltip h6 {
    margin: 0;
  }
`;

export const HUD = styled('div')`
  position: fixed;
  z-index: 1000;
  left: 1em;
  top: 1em;
  background: rgba(0,0,0,0.8);
  border-radius: 0.5em;
  color: #fff;
  padding: 0.5em;
  max-width: 200px;
  max-height: 200px;
  overflow-y: scroll;
`;

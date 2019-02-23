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

export const Bar = styled('div')`
  width: 20em;
  height: 1em;
  background: grey;
  position: relative;
`;

export const BarFill = styled('div')`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: red;
`;

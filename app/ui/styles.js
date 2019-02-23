import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Arimo:400,400i,700,700i');

  html,
  body {
    overflow: hidden;
    margin: 0;
    padding: 0;
    font-family: 'Arimo', 'Helvetiva', sans-serif;
    background: #eee;
  }

  .tooltip h5, .tooltip h6 {
    margin: 0;
  }
`;

export const Bar = styled('div')`
  width: 20em;
  max-width: 100%;
  height: 1em;
  background: #eee;
  position: relative;
`;

export const BarFill = styled('div')`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: #39e567;
`;

export const Button = styled('div')`
  color: #fff;
  background: #395be5;
  text-align: center;
  padding: 0.25em 0.5em;
  font-weight: bold;
  cursor: pointer;
  &:hover {
    background: #2f51d8;
  }
`;

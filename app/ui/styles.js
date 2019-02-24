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

  .tooltip {
    background: #fff;
    border: 2px solid black;
    padding: 0.5em;
  }
  .tooltip h5, .tooltip h6 {
    margin: 0;
  }

  .job-status {
    display: flex;
  }
  .job-risk {
    flex: 1.5;
  }
  .job-risk-low {
    color: #39e567;
  }
  .job-risk-moderate {
    color: #f9993e;
  }
  .job-risk-high {
    color: #fe0f0f;
  }
  .job-tooltip {
    min-width: 20em;
  }
  .job-tooltip h3 {
    margin: 0 0 0.5em 0;
    font-size: 1em;
  }
  .job-skills {
    margin-top: 0.5em;
    border-top: 2px solid black;
  }
  .job-skills ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
  .job-skills h5 {
    margin: 0.5em 0 0.25em 0;
    font-size: 1em;
  }

  .automation-icon {
    width: 8px;
    height: 8px;
    border-radius: 10em;
    display: inline-block;
    margin-right: 4px;
  }
  .automation-icon-low {
    background: #39e567;
  }
  .automation-icon-moderate {
    background: #f9993e;
  }
  .automation-icon-high {
    background: #fe0f0f;
  }

  .automated {
    text-decoration: line-through;
    opacity: 0.5;
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

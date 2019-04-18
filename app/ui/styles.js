import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Arimo:400,400i,700,700i');

  canvas {
    cursor: grab;
  }

  html,
  body {
    overflow: hidden;
    margin: 0;
    padding: 0;
    font-family: 'Arimo', 'Helvetiva', sans-serif;
    background: #eee;
  }

  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }

  .tooltip {
    background: #fff;
    border: 2px solid black;
    padding: 0.5em;
  }
  .tooltip h5, .tooltip h6 {
    margin: 0;
  }

  .annotation {
    position: absolute;
    font-size: 0.3em;
    line-height: 1;
  }

  .job-status {
    display: flex;
    margin-top: 0.25em;
    font-size: 0.85em;
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
    width: 20em;
  }
  .job-tooltip h3,
  .job-tooltip h5 {
    margin: 0;
    font-size: 1em;
  }
  .job-tooltip h5 {
    margin: 0 0 0.5em 0;
    font-weight: normal;
    font-size: 0.8em;
  }
  .job-industries {
    font-size: 0.65em;
  }
  .job-industries > div {
    padding: 2px;
    background: #ddd;
    display: inline-block;
    margin-bottom: 1px;
  }
  .job-skills {
    margin-top: 0.5em;
    border-top: 2px solid black;
    font-size: 0.75em;
  }
  .job-skills h5 {
    display: flex;
    justify-content: space-between;
  }
  .job-skills span {
    display: block;
  }
  .job-skills span:last-child {
    text-align: right;
  }
  .job-skills ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
  .job-skills li {
    padding: 0.2em;
    padding-right: 8px;
    width: 32%;
    box-sizing: border-box;
    background: #eee;
    margin-bottom: 0.5em;
    position: relative;
    word-wrap: break-word;
  }
  .job-skills h5 {
    margin: 0.5em 0 0.25em 0;
    font-size: 1em;
  }
  .job-applied {
    text-align: center;
    background: #000;
    color: #fff;
    padding: 0.2em;
    margin-bottom: 0.5em;
  }

  .skill-level-bar {
    width: 6px;
    display: inline-block;
    background: #bbb;
    position: absolute;
    right: 0;
    bottom: 0;
    top: 0;
  }
  .skill-level-bar-fill {
    background: #555;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
  }
  .automation-low {
    border-top: 3px solid #39e567;
  }
  .automation-moderate {
    border-top: 3px solid #f9993e;
  }
  .automation-high {
    border-top: 3px solid #fe0f0f;
  }

  .skills-legend {
    font-size: 0.9em;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    padding: 0.5em;
    border-top: 2px solid black;
    z-index: 10;
  }

  .job-legend, .skills-legend {
    display: flex;
    justify-content: space-between;
  }
  .skill-legend .skill-level-bar {
    position: relative;
    height: 10px;
  }
  .skill-legend .skill-level-bar-fill {
    height: 65%;
  }
  .automation-legend {
    font-size: 0.9em;
  }
  .automation-legend > div {
    width: 8px;
    height: 8px;
    display: inline-block;
  }
  .automation-low-key {
    background: #39e567;
  }
  .automation-moderate-key {
    background: #f9993e;
    margin-left: 8px;
  }
  .automation-high-key {
    background: #fe0f0f;
    margin-left: 8px;
  }

  .automated {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: -3px;
    border: 2px solid #888;
    background: rgba(255,255,255,0.9);
    text-align: center;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }

  .hud-notice {
    background: red;
    color: #fff;
    text-align: center;
    font-weight: bold;
  }

  .info-tooltip {
    background: #222 !important;
    border-radius: 0 !important;
    padding: 0.3em 0.5em !important;
    margin-top: 0 !important;
    opacity: 1 !important;
    z-index: 1000000;
  }
  .info-tooltip::after {
    border-top-width: 0 !important;
  }

  .ReactModal__Content {
    overflow-y: hidden !important;
    padding: 0 !important;
  }
  .ReactModal__Content > div{
    padding: 1em;
  }
  .ReactModal__Content h3 {
    margin: 0 0 1em 0;
  }

  .item-box {
    background: #eee;
    border: 1px solid #aaa;
    padding: 0.5em;
    margin: 1em 0;
  }
`;

export const Bar = styled('div')`
  width: 20em;
  max-width: 100%;
  height: 1em;
  position: relative;
  background: ${props => props.background || '#eee'};
`;

export const BarFill = styled('div')`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: ${props => props.background || 'linear-gradient(to bottom, #7de984 0%,#4bab48 100%)'};
  width: ${props => `${props.width < 1 ? props.width * 100 : props.width}%`};
`;

export const Button = styled('div')`
  color: #fff;
  background: ${props => props.disabled ? '#aaa' : '#395be5'};
  ${props => props.highlight ? 'background: #ea432a;' : ''}
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  text-align: center;
  padding: 0.25em 0.5em;
  font-weight: bold;
  flex: 1;
  margin-right: 1px;
  &:last-child {
    margin-right: 0;
  }
  &:hover {
    background: ${props => props.disabled ? '#aaa' : '#2f51d8'};
    ${props => props.highlight ? 'background: #ea432a;' : ''}
  }
`;

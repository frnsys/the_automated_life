import ReactDOM from 'react-dom';
import React, { useRef, useState, useEffect } from 'react';
import { animated, useTransition } from 'react-spring';
import styled from 'styled-components';

let id = 0;
const defaultTimeout = 6000;

const Container = styled('div')`
  font-size: 0.8em;
  position: fixed;
  z-index: 1000;
  width: 0 auto;
  top: ${props => (props.top ? '1em' : 'unset')};
  bottom: ${props => (props.top ? 'unset' : '1em')};
  margin: 0 auto;
  right: 1em;
  display: flex;
  flex-direction: ${props => (props.top ? 'column-reverse' : 'column')};
  pointer-events: none;
  align-items: ${props => (props.position === 'center' ? 'center' : `flex-${props.position || 'end'}`)};
  @media (max-width: 680px) {
    align-items: center;
  }
`;

const Message = styled(animated.div)`
  box-sizing: border-box;
  position: relative;
  width: 40ch;
  margin-bottom: 0.5em;
  @media (max-width: 680px) {
    width: 100%;
  }
`;

const Title = styled('h5')`
  font-size: 1em;
  margin: 0;
`;

const Body = styled('div')`
  margin-top: 0.5em;
`;

export const Content = styled('div')`
  border: 2px solid black;
  color: #000;
  background: #fff;
  padding: 0.5em;
  font-size: 1em;
  display: grid;
  grid-template-columns: ${props => (props.canClose === false ? '1fr' : '1fr auto')};
  grid-gap: 0.5em;
  height: auto;
  overflow: hidden;
`;

function Notifications({ config = { tension: 125, friction: 20, precision: 0.1 }, timeout = defaultTimeout, children }) {
  const [refMap] = useState(() => new WeakMap())
  const [cancelMap] = useState(() => new WeakMap())
  const [items, setItems] = useState([])
  const transitions = useTransition(items, item => item.key, {
    from: { opacity: 0, height: 0 },
    enter: item => async next => await next({ opacity: 1, height: refMap.get(item).offsetHeight }),
    leave: item => async (next, cancel) => {
      cancelMap.set(item, cancel)
      await next({ opacity: 0 })
      await next({ height: 0 })
    },
    onRest: item => setItems(state => state.filter(i => i.key !== item.key)),
    config: (item, state) => (state === 'leave' ? [{ duration: timeout }, config, config] : config),
  })

  useEffect(() => void children((title, msg) => setItems(state => [...state, { key: id++, title, msg }])), [])
  return (
    <Container top={false}>
      {transitions.map(({ key, item, props: { ...style } }) => (
        <Message key={key} style={style}>
          <Content ref={ref => ref && refMap.set(item, ref)}>
            <div>
              <Title>{item.title}</Title>
              {item.msg ? <Body>{item.msg}</Body> : ''}
            </div>
          </Content>
        </Message>
      ))}
    </Container>
  )
}

export default Notifications;

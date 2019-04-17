import React from 'react';
import App from './app/ui/app';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {loadLanguage} from './app/i18n';
import store from 'store';

loadLanguage(() => {
  render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('main'));
});

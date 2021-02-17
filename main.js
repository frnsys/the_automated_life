import React from 'react';
import App from './app/ui/app';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {loadLanguage} from './app/i18n';
import config from './config';
import store from 'store';
import jobs from 'data/jobs.json';
import MobileWarning from './app/ui/mobile';

const MIN_WIDTH = 480;

function checkGDPR(cb) {
  fetch(`/gdpr`)
    .then(response => response.json())
    .then(json => {
      cb(json.success);
    });
}

if (screen.width >= MIN_WIDTH) {
  loadLanguage(() => {
    checkGDPR((gdpr) => {
      render(
        <Provider store={store}>
          <App gdpr={gdpr || config.forceGdpr} jobs={jobs} />
        </Provider>,
        document.getElementById('main'));
    });
  });
} else {
  loadLanguage(() => {
    render(<MobileWarning />, document.getElementById('main'));
  });
}

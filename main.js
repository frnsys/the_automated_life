import React from 'react';
import App from './app/ui/app';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {loadLanguage} from './app/i18n';
import config from './config';
import store from 'store';
import jobs from 'data/jobs.json';

function checkGDPR(cb) {
  fetch(`/gdpr`)
    .then(response => response.json())
    .then(json => {
      cb(json.success);
    });
}

loadLanguage(() => {
  checkGDPR((gdpr) => {
    render(
      <Provider store={store}>
        <App gdpr={gdpr || config.forceGdpr} jobs={jobs} />
      </Provider>,
      document.getElementById('main'));
  });
});

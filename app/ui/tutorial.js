import t from 'i18n';
import log from 'log';
import config from 'config';
import store from '../store';
import graph from './3d/graph';

class Tutorial {
  constructor(togglePause) {
    this.togglePause = togglePause;
    document.body.classList.add('tutorial--active');
    this.setStep(0);
  }

  startGame() {
    log('finished-tutorial', {});
    document.body.classList.remove('tutorial--active');

    // Create some starting tasks
    store.dispatch({
      type: 'player:newTask',
      payload: 8
    });

    this.togglePause();
  }

  get step() {
    return config.tutorial[this._step];
  }

  setStep(i) {
    this._step = i;
    let step = this.step;
    if (!step) return;

    let el = document.createElement('div');
    el.innerHTML = t(step.tooltip.text, {
      age: config.retirementAge,
      savings: config.retirementSavingsMin.toLocaleString(),
      debtLimit: config.gameOverBalance.toLocaleString()
    });
    el.classList.add('tutorial--tooltip');
    let pa = document.querySelector(step.tooltip.parent);
    pa.appendChild(el);

    let {player} = store.getState();
    let pos = step.tooltip.position;
    if (typeof pos === 'function') {
      pos = pos(player, graph);
    }
    Object.keys(pos).forEach((k) => {
      el.style[k] = pos[k];
    });

    let ok = document.createElement('div');

    if (this._step == config.tutorial.length - 1) {
      ok.innerText = t('start_button');
    } else {
      ok.innerText = t('next');
    }
    ok.classList.add('button');
    ok.classList.add('tutorial--tooltip-next');
    ok.addEventListener('click', () => {
      this.next();
    });
    el.appendChild(ok);

    // Skip tutorial button
    let skip = document.createElement('div');
    skip.innerText = t('skip_tutorial');
    skip.classList.add('tutorial--skip');
    skip.addEventListener('click', () => {
      this.skip();
    });
    el.appendChild(skip);

    if (step.onStart) step.onStart(store);
    this.el = el;
  }

  skip() {
    this.el.parentNode.removeChild(this.el);
    config.tutorial.forEach((step) => {
      if (step.onCompletion) step.onCompletion();
    });
    this.startGame();
  }

  next() {
    if (this._step <= config.tutorial.length - 1) {
      if (this.step.onCompletion) this.step.onCompletion();
      this.el.parentNode.removeChild(this.el);
      this.setStep(this._step + 1);
    }
    if (this._step == config.tutorial.length) {
      this.startGame();
    }
  }
}

export default Tutorial;

import t from 'i18n';
import log from 'log';
import config from 'config';
import store from '../store';
import graph from './3d/graph';

class Tutorial {
  constructor() {
    document.body.classList.add('tutorial--active');
    this.setStep(0);
  }

  startGame() {
    log('finished-tutorial', {});
    document.body.classList.remove('tutorial--active');
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
    ok.innerText = t('next');
    ok.classList.add('button');
    ok.classList.add('tutorial--tooltip-next');
    ok.addEventListener('click', () => {
      this.next();
    });
    el.appendChild(ok);

    if (step.onStart) step.onStart(store);
    this.el = el;
  }

  skip() {
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
  }
}

export default Tutorial;

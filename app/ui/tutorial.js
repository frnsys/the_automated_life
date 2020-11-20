import t from 'i18n';
import log from 'log';
import config from 'config';
import store from '../store';
import graph from './3d/graph';

class Tutorial {
  constructor(spec) {
    this.spec = spec;
    document.body.classList.add('tutorial--active');
    window.tutorialActive = this; // to avoid multiple tutorials at once
    setTimeout(() => {
      this.setStep(0);
    }, this.spec.delay * 1000 || 0);
  }

  get step() {
    return this.spec.tooltips[this._step];
  }

  setStep(i) {
    this._step = i;
    let step = this.step;
    if (!step) return;

    let el = document.createElement('div');
    el.innerHTML = t(step.text, {
      age: config.retirementAge,
      savings: config.retirementSavingsMin.toLocaleString(),
      debtLimit: config.gameOverBalance.toLocaleString()
    });
    el.classList.add('tutorial--tooltip');
    let pa = document.querySelector(step.parent);
    pa.appendChild(el);

    let {player} = store.getState();
    let pos = step.position;
    if (typeof pos === 'function') {
      pos = pos(player, graph);
    }
    Object.keys(pos).forEach((k) => {
      el.style[k] = pos[k];
    });

    let last = this._step == this.spec.tooltips.length - 1;
    if (!last || !this.spec.finished) {
      let ok = document.createElement('div');
      ok.classList.add('button');
      ok.classList.add('tutorial--tooltip-next');
      ok.addEventListener('click', () => {
        this.next();
      });
      el.appendChild(ok);

      if (last) {
        ok.innerText = t('ok');
      } else {
        ok.innerText = t('next');

        // Skip tutorial button
        let skip = document.createElement('div');
        skip.innerText = t('skip_tutorial');
        skip.classList.add('tutorial--skip');
        skip.addEventListener('click', () => {
          this.skip();
        });
        el.appendChild(skip);
      }
    }

    if (step.onStart) step.onStart(store, graph);
    this.el = el;
  }

  finish() {
    window.tutorialActive = null;
    if (this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
    if (this.spec.finished) {
      let lastStep = this.spec.tooltips[this.spec.tooltips.length - 1];
      if (lastStep.onCompletion) lastStep.onCompletion(store, graph);
    }
  }

  finished(state) {
    let last = this._step == this.spec.tooltips.length - 1;
    return (!this.spec.finished || this.spec.finished(state)) && last;
  }

  skip() {
    this.el.parentNode.removeChild(this.el);
    this.spec.tooltips.forEach((step) => {
      if (step.onCompletion) step.onCompletion(store, graph);
    });
    this.finish();
  }

  next() {
    if (this._step <= this.spec.tooltips.length - 1) {
      if (this.step.onCompletion) this.step.onCompletion(store, graph);
      this.el.parentNode.removeChild(this.el);
      this.setStep(this._step + 1);
    }
    if (this._step == this.spec.tooltips.length && !this.spec.finished) {
      this.finish();
    }
  }
}

export default Tutorial;

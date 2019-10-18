import t from 'i18n';
import React, {useState} from 'react';
import {connect} from 'react-redux';
import config from 'config';

function checkTask(taskType, taskIdx, seq, pattern, setSeq, doWork, doTask) {
  if (window.paused) {
    return;
  } else {
    // Update current task sequence
    let curSeq = seq.concat([taskType]);

    // Wrong pattern
    if (!curSeq.every((t, i) => t == undefined || t == pattern[i])) {
      curSeq = [];

      // Flash red
      let barOutline = document.querySelector('.work-bar');
      barOutline.classList.add('bar-failure');
      setTimeout(() => {
        barOutline.classList.remove('bar-failure');
      }, 300);


    // Correct pattern
    } else if (pattern.every((t, i) => t == curSeq[i])) {
      curSeq = [];

      // Flash green
      let barOutline = document.querySelector('.work-bar');
      barOutline.classList.add('bar-success');
      setTimeout(() => {
        barOutline.classList.remove('bar-success');
      }, 300);

      // Successful work
      doWork();
    }

    // Always remove the task
    doTask(taskIdx);

    // Update state
    setSeq(curSeq);
  }
}

const Work = (props) => {
  const [seq, setSeq] = useState([]);

  // Don't show work minigame if not employed
  let job = props.player.job.name;
  if (job == 'Unemployed' || job == 'Student') {
    return <div></div>;
  }
  let p = props.player.performance;
  let performance = 'Decent';
  let performanceColor = '#000';
  if (p <= 10) {
    performance = t('performance_terrible');
    performanceColor = '#f71d09';
  } else if (p <= 30) {
    performance = t('performance_bad');
    performanceColor = '#ef5028';
  } else if (p <= 60) {
    performance = t('performance_mediocre');
    performanceColor = '#efb428';
  } else if (p <= 80) {
    performance = t('performance_good');
    performanceColor = '#11c441';
  } else if (p <= 100) {
    performance = t('performance_fantastic');
    performanceColor = '#d119e5';
  }

  let pattern = props.player.job.pattern;

  return <div className='work'>
    <div className='work-pattern'>
      {pattern.map((taskType, i) => {
        return <div className='work-pattern-icon' key={i} style={{backgroundColor: config.taskColors[taskType]}}>{seq[i] == taskType ? '✓' : ''}</div>;
      })}
    </div>
    <div className='work-bar'>
      <div className='bar' style={{background: '#fff'}}>
        <div className='bar-fill' style={{width: `${props.player.performance}%`}} />
      </div>
      <div className='performance-label'>{t('performance')}: <span style={{color: performanceColor}}>{performance}</span></div>
    </div>
    <div>
      {props.player.tasks.map((taskType, i) => {
        return <div className='work-button' style={{backgroundColor: config.taskColors[taskType]}} key={i} onClick={() => checkTask(taskType, i, seq, pattern, setSeq, props.work, props.task)}>{t('work_button')}</div>;
      })}
    </div>
  </div>;
}

const mapStateToProps = (state, props) => {
    return state;
};

const mapActionsToProps = {
  work: () => {
    return {
      type: 'player:work'
    };
  },
  task: (taskIndex) => {
    return {
      type: 'player:task',
			payload: taskIndex
    };
  }
}

export default connect(mapStateToProps, mapActionsToProps)(Work);

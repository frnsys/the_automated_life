import t from 'i18n';
import React from 'react';
import {connect} from 'react-redux';
import config from 'config';

const Work = (props) => {
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
  return <div className='work'>
    <div className='work-bar'>
      <div className='bar' style={{background: '#fff'}}>
        <div className='bar-fill' style={{width: `${props.player.performance}%`}} />
      </div>
      <div className='performance-label'>{t('performance')}: <span style={{color: performanceColor}}>{performance}</span></div>
    </div>
    <div>
      {[...Array(props.player.tasks)].map((i) => {
        return <div className='work-button' key={i} onClick={() => window.paused ? '' : props.work()}>{t('work_button')}</div>;
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
  }
}

export default connect(mapStateToProps, mapActionsToProps)(Work);

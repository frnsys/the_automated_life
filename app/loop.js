import t from 'i18n';
import log from 'log';
import config from 'config';
import store from 'store';
import logic from './logic';
import graph from './ui/3d/graph';
import skills from 'data/skills.json'

// Set defaults
window.speedup = 1;
window.paused = true;

// For collecting wage change data
// window.wageChanges = {};

// Game loop
let lastTime = 0;
function loop(now) {
  // Get elapsed time, capping it
  // to a reasonable amount
  // (to prevent the game from running away
  // if the user is focused elsewhere)
  let elapsed = now - lastTime; // ms
  elapsed = Math.min(elapsed, 100);

  let {scenario, player, robots, time, jobs} = store.getState();
  let logTime = {year: time.years, month: time.month};

  if (!window.paused) {
    let inSchool = player.job.name == 'Student';

    // Check game over
    if (player.gameOver) return;
    if (player.cash <= config.gameOverBalance/2 && !player.gameOverWarned) {
      store.dispatch({
        type: 'player:gameOverWarned'
      });
      notify(`${t('game_over_warning',
        {amount: (config.gameOverBalance*-1).toLocaleString()})}`,
        '', {background: '#ea432a', color: '#fff'});
    } else if (player.cash <= config.gameOverBalance || (config.testGameOver && time.months > 1)) {
      store.dispatch({
        type: 'player:gameOver'
      });
      log('gameOver', {success: false, time: logTime}, () => {
        gameOver({icon: 'lose_debt', text: t('game_over_debt')});
      });
      return;
    } else if (player.cash > 0 && player.gameOverWarned) {
      store.dispatch({
        type: 'player:resetGameOverWarned'
      });
    }

    if (player.wasFired) {
      log('fired', {time: logTime});
      graph.reveal(null);
      store.dispatch({
        type: 'player:resetFired'
      });
    }

    // Prepare next scheduled robot for release
    let nextRobot = scenario.schedule[0];
    if (nextRobot) {
      if (time.months >= nextRobot.months) {
        logic.releaseRobot(nextRobot);
        store.dispatch({
          type: 'scenario:increment'
        });

        let skillNames = nextRobot.skills.map((s_id) => t(skills[s_id].name));
        let skillsDesc = [skillNames.slice(0, -1).join(', '), skillNames.slice(-1)[0]]
          .join(skillNames.length < 2 ? '' : ' & ').toLowerCase();
        let affectsJob = nextRobot.skills.filter((s_id) => player.job.skills && Object.keys(player.job.skills).includes(s_id.toString())).length > 0;
        if (affectsJob) {
          notify(`🤖 ${t('robot_release', {
            name: nextRobot.name,
            skills: skillsDesc})
          }`, t('robot_effect_true'), {background: '#ffa1a1', color: '#000'});
        } else {
          notify(`🤖 ${t('robot_release', {
            name: nextRobot.name,
            skills: skillsDesc})
          }`);
        }
        news(`🤖 ${t('robot_release_long', {
          name: nextRobot.name,
          skills: skillsDesc})
        }`, affectsJob ? {
          text: t('robot_effect_true'),
          color: '#fe0f0f'
        } : {
          text: t('robot_effect_false'),
          color: '#111111'
        });

        // Update graph annotations
        Object.keys(graph.nodes).forEach((n_id) => {
          let job = jobs[n_id.toString()];
          let automated = logic.percentAutomated(job);
          if (automated >= 0.5) {
            graph.nodes[n_id].anno.innerHTML = `${t(job.name)} 🤖`;
          }
        });
      }

      // Teaser news stories
      scenario.schedule.forEach((r, i) => {
        if (!r.teased && time.months == r.months - config.newRobotWarningMonths){
          // Skip teasers if game speed is high
          if (window.speedup < 2 && !inSchool) {
            notify(`💡 ${t(r.news.headline)}`);
          }
          store.dispatch({
            type: 'scenario:teased',
            payload: i
          });
        }
      });
    }

    if (!isNaN(elapsed)) {
      let unemployed = player.job.name == 'Unemployed' && !player.application;

      // Tick time
      let speedup = window.speedup;
      if (inSchool) {
        speedup = config.schoolTimeSpeedup;
        window.speedup = speedup;
        window.updateSpeed(speedup);
      }
      store.dispatch({
        type: 'time',
        payload: {
          speedup: speedup,
          elapsed: elapsed
        }
      });

      if (time.newYear) {
        let age = player.startAge + time.years;

        // Every tenth birthday, show retirement reminder
        if ((age) % 10 == 0) {
          let yearsLeft = config.retirementAge - age;
          let cash = player.cash - player.debt.reduce((acc, d) => acc + d.remaining, 0);
          let estimate = Math.round(cash + ((cash/time.years) * yearsLeft))
            .toLocaleString();
          notify(`🎂 ${t('birthday_title', {age})}`,
            t('birthday_body', {yearsLeft, estimate}), {background: '#666DF9', color: '#fff'});
        }
        store.dispatch({
          type: 'player:birthday'
        });
      }

      // Check if new month
      if (time.newMonth) {
        // For gathering wage change data
        // Object.keys(jobs).forEach((id) => {
        //   if (!(id in window.wageChanges)) {
        //     window.wageChanges[id] = [];
        //   }
        //   window.wageChanges[id].push(jobs[id].wageAfterTaxes);
        // });

        store.dispatch({
          type: 'player:income'
        });
        store.dispatch({
          type: 'player:expenses'
        });

        if (!inSchool && player.job.name !== 'Unemployed') {
          store.dispatch({
            type: 'player:evaluatePerformance'
          });
        }

        if (player.badPerformanceStreak > 0 && player.badPerformanceStreak < config.maxBadPerformanceStreak) {
            notify(`⚠️ ${t('bad_performance_warning',
              {months: player.badPerformanceStreak})}`,
              '', {background: '#ea432a', color: '#fff', fontWeight: 'bold'});
        }

        // Countdown robots to deepening automation
        store.dispatch({
          type: 'robot:countdown'
        });

        log('month', {
          savings: player.cash,
          debt: player.debt,
          expenses: player.expenses,
          education: player.education,
          job: {
            id: player.job.id,
            wage: player.job.wage,
            baseWage: player.job.baseWage,
            wageAfterTaxes: player.job.wageAfterTaxes,
          },
          time: logTime
        });

        // Countdown player application
        if (player.application && player.application.countdown <= 0) {
          let job = jobs[player.application.id];

          // Hired
          if (config.perfectApplicant || Math.random() <= player.application.prob) {
            if (inSchool) {
              log('dropout', {education: player.education, time: logTime});
            }

            store.dispatch({
              type: 'player:hire',
              payload: job
            });
            milestone(t('hired', {name: t(job.name)}), '', 'hired');
            notify(`🎉 ${t('hired', {name: t(job.name)})}`,
              '', {background: '#1fd157', color: '#fff'});
            log('hired', {job: job.id, time: logTime});
            graph.resetEdgeColor(graph.appliedNode, graph.focusedNodeId);
            graph.appliedNode = null;
            graph.reveal(player.application.id);

          // Rejected
          } else {
            notify(`😞 ${t('rejected',
              {name: t(job.name), mainFactor: player.application.mainFactor})}`,
              '', {background: '#ea432a', color: '#fff'});
            log('rejected', {job: job.id, time: logTime});
            graph.resetNodeColor(graph.appliedNode, player);
            let appliedId = graph.appliedNode.data.id;
            graph.appliedNode = null;
            graph.resetEdgeColor(graph.focusedNodeId, appliedId);
          }
        }
        store.dispatch({
          type: 'player:application'
        });

        // Check school
        if (inSchool) {
          store.dispatch({
            type: 'player:learn'
          });
          if (player.schoolCountdown <= 0) {
            store.dispatch({
              type: 'player:graduate'
            });
            log('graduated', {education: player.education, time: logTime});
          }
        }

        // Check game end state
        if (player.startAge + time.years >= config.retirementAge || player.retireEarly) {
          // window.location.href = 'data:plain/text,' + JSON.stringify(wageChanges);
          if (player.cash >= config.retirementSavingsMin || player.retireEarly) {
            log('gameEnd', {success: true, cash: player.cash, time: logTime}, () => {
              gameOver({icon: 'win_retire', text: t('game_over_win')});
            });
          } else {
            log('gameEnd', {success: false, cash: player.cash, time: logTime}, () => {
              gameOver({icon: 'lose_robot', text: t('game_over_lose')});
            });
          }
          store.dispatch({
            type: 'player:gameOver'
          });
        }
      }
    }

    if (player.job.name !== 'Unemployed') {
      store.dispatch({
        type: 'player:slack'
      });
    }

    // Check for deepening automation
    Object.values(robots).filter((r) => !r.deepened && r.deepeningCountdown <= 0).forEach((r) => {
      logic.deepeningAutomation(r);
      store.dispatch({
        type: 'robot:deepened',
        payload: r.id
      });
      store.dispatch({
        type: 'job:newSkill',
        payload: r
      });
    });

  }

  lastTime = now;
  requestAnimationFrame(loop);
}

export default loop;

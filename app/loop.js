import t from 'i18n';
import log from 'log';
import config from 'config';
import store from 'store';
import logic from './logic';
import graph from './ui/3d/graph';
import skills from 'data/skills.json'

// Set default speedup
window.speedup = 1;

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

    // Check game over
    if (player.gameOver) return;
    if (player.cash <= config.gameOverBalance) {
      store.dispatch({
        type: 'player:gameOver'
      });
      log('gameOver', {time: logTime});
      gameOver({icon: '💸', text: t('game_over_debt')});
      return;
    }

    // Prepare next scheduled robot for release
    let nextRobot = scenario.schedule[0];
    if (nextRobot) {
      if (time.months >= nextRobot.months) {
        logic.releaseRobot(nextRobot);
        store.dispatch({
          type: 'scenario:increment'
        });

        let skillNames = nextRobot.skills.map((s_id) => skills[s_id].name);
        let skillsDesc = [skillNames.slice(0, -1).join(', '), skillNames.slice(-1)[0]]
          .join(skillNames.length < 2 ? '' : ' and ').toLowerCase();
        notify(`🤖 ${t('robot_release', {
          name: nextRobot.name,
          skills: skillsDesc})
        }`);
      }

      // Teaser news stories
      scenario.schedule.forEach((r, i) => {
        if (!r.teased && time.months == r.months - config.newRobotWarningMonths){
          notify(`💡 ${r.news.headline}`);
          store.dispatch({
            type: 'scenario:teased',
            payload: i
          });
        }
      });
    }

    if (!isNaN(elapsed)) {
      let inSchool = player.job.name == 'Student';
      let unemployed = player.job.name == 'Unemployed' && !player.application;

      // Tick time
      let speedup = window.speedup;
      if (inSchool) {
        speedup = config.schoolTimeSpeedup;
      } else if (unemployed) {
        speedup = config.unemployedTimeSpeedup;
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
          let estimate = Math.round(player.cash + ((player.cash/time.years) * yearsLeft))
            .toLocaleString();
          notify(`🎂 ${t('birthday_title', {age})}`,
            t('birthday_body', {yearsLeft, estimate}));
        }
        store.dispatch({
          type: 'player:birthday'
        });
        notify(t('inflation'));
      }

      // Check if new month
      if (time.newMonth) {
        store.dispatch({
          type: 'player:income'
        });
        store.dispatch({
          type: 'player:expenses'
        });

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
            notify(`🎉 ${t('hired', {name: job.name})}`,
              '', {background: '#1fd157', color: '#fff'});
            log('hired', {job: job.id, time: logTime});
            graph.reveal(player.application.id);

          // Rejected
          } else {
            notify(`😞 ${t('rejected',
              {name: job.name, mainFactor: player.application.mainFactor})}`,
              '', {background: '#ea432a', color: '#fff'});
            log('rejected', {job: job.id, time: logTime});
            graph.resetNodeColor(graph.appliedNode, player);
            graph.appliedNode = null;
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
        if (player.startAge + time.years >= config.retirementAge) {
          if (player.cash >= config.retirementSavingsMin) {
            gameOver({icon: '🏖️', text: t('game_over_win')});
            log('gameEnd', {success: true, cash: player.cash, time: logTime});
          } else {
            gameOver({icon: '🤖', text: t('game_over_lose')});
            log('gameEnd', {success: false, cash: player.cash, time: logTime});
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

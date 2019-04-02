import config from 'config';
import store from 'store';
import logic from './logic';
import graph from './ui/3d/graph';
import skills from 'data/skills.json'

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

  if (!time.paused) {

    // Check game over
    if (player.gameOver) return;
    if (player.cash <= config.gameOverBalance) {
      store.dispatch({
        type: 'player:gameOver'
      });
      alert('Game Over');
      return;
    }

    let nextRobot = scenario.schedule[0];
    if (nextRobot) {
      if (time.months >= nextRobot.months) {
        logic.createRobot(nextRobot);
        store.dispatch({
          type: 'scenario:increment'
        });

        let skillsList = nextRobot.skills.map((s_id) => skills[s_id].name);
        skillsList = [skillsList.slice(0, -1).join(', '), skillsList.slice(-1)[0]].join(skillsList.length < 2 ? '' : ' and ');
        let efficiencyDesc = 'is capable of';
        if (nextRobot.efficiency >= 0.75) {
          efficiencyDesc = 'excels at';
        }
        notify(`🤖 RoboCo releases "${nextRobot.name}"`,
          `A new robot from RoboCo hit the market today. The ${nextRobot.name} ${efficiencyDesc} ${skillsList}.`);
      }

      // Teaser news stories
      scenario.schedule.forEach((r, i) => {
        if (!r.teased && time.months == r.months - config.newRobotWarningMonths){
          let skillsList = r.skills.map((s_id) => skills[s_id].name);
          skillsList = [skillsList.slice(0, -1).join(', '), skillsList.slice(-1)[0]].join(skillsList.length < 2 ? '' : ' and ');
          notify(`💡 ${r.news.headline}`, r.news.body);
          store.dispatch({
            type: 'scenario:teased',
            payload: i
          });
        }
      });
    }

    if (!isNaN(elapsed)) {
      let inSchool = player.job.name == 'Student';
      store.dispatch({
        type: 'time',
        payload: {
          speedup: inSchool ? config.schoolTimeSpeedup : 1,
          elapsed: elapsed
        }
      });

      if (time.newYear) {
        let age = player.startAge + time.years;
        if ((age) % 10 == 0) {
          let yearsLeft = config.retirementAge - age;
          let estimate = Math.round(player.cash + ((player.cash/time.years) * yearsLeft));
          notify(`🎂 Happy ${age}th birthday!`, `You're ${yearsLeft} years from retirement. At this rate, you'll save $${estimate.toLocaleString()} by then.`);
        }
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

        // Countdown player application
        if (player.application && player.application.countdown <= 0) {
          let job = jobs[player.application.id];
          if (config.perfectApplicant || Math.random() <= player.application.prob) {
            store.dispatch({
              type: 'player:hire',
              payload: job
            });
            notify(`🎉 You were hired as a ${job.name}.`);
            graph.reveal(player.application.id);
          } else {
            notify(`😞 Your application as a ${job.name} was rejected because of your ${player.application.mainFactor}.`);
            graph.resetNodeColor(graph.appliedNode, player);
            graph.appliedNode = null;
          }
        }
        store.dispatch({
          type: 'player:application'
        });

        if (player.job.name == 'Student') {
          store.dispatch({
            type: 'player:learn'
          });
          if (player.schoolCountdown <= 0) {
            store.dispatch({
              type: 'player:graduate'
            });
          }
        }

        // Check game end state
        if (player.startAge + time.years >= config.retirementAge) {
          if (player.cash >= config.retirementSavingsMin) {
            alert('game over, you win');
          } else {
            alert('game over, you lose');
          }
        }
      }
    }

    store.dispatch({
      type: 'player:slack'
    });

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

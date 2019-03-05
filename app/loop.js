import config from 'config';
import store from 'store';
import logic from './logic';
import util from './util';
import graph from './ui/3d/graph';
import skills from 'data/skills.json'

// Game loop
let lastTime = 0;
function loop(now) {
  let elapsed = now - lastTime; // ms
  let {scenario, player, robots, time, jobs} = store.getState();

  if (player.cash <= config.gameOverBalance) {
    alert('Game Over');
  }

  let nextRobot = scenario.schedule[0];
  let date = util.timeToDate(time);
  if (nextRobot) {
    if (date.months >= nextRobot.months) {
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
      notify(`RoboCo releases "${nextRobot.name}"`,
        `A new robot from RoboCo hit the market today. The ${nextRobot.name} ${efficiencyDesc} ${skillsList}.`);
    }

    // Teaser news stories
    scenario.schedule.forEach((r, i) => {
      if (!r.teased && date.months == r.months - 6){
        let skillsList = r.skills.map((s_id) => skills[s_id].name);
        skillsList = [skillsList.slice(0, -1).join(', '), skillsList.slice(-1)[0]].join(skillsList.length < 2 ? '' : ' and ');
        notify(`Researchers in South Korea make breakthrough`,
          `Robotics researchers at the South Korea Institute of Technology pioneered a new technique in ${skillsList} today.`);
        store.dispatch({
          type: 'scenario:teased',
          payload: i
        });
      }
    });
  }

  if (!isNaN(elapsed)) {
    store.dispatch({
      type: 'time',
      payload: elapsed
    });

    // Check if new month
    let newDate = util.timeToDate(time + elapsed);
    if (date.month !== newDate.month) {
      // TODO Note that this will trigger re-renders;
      // we need to be careful about re-rendering every frame
      // as this will slow things down, e.g. notifications
      // TESTING earn money
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
        if (true || Math.random() <= player.application.prob) {
          store.dispatch({
            type: 'player:hire',
            payload: job
          });
          notify(`You were hired as a ${job.name}.`);
          graph.reveal(player.application.id);
        } else {
          notify(`Your application as a ${job.name} was rejected.`);
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
      if (player.startAge + newDate.years >= config.retirementAge) {
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
  });

  lastTime = now;
  requestAnimationFrame(loop);
}

export default loop;

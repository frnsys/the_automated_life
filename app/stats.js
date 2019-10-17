import config from 'config';
import Chart from 'chart.js';
import jobs from 'data/jobs.json'
import education from 'data/education.json'
import ChartAnnotation from 'chartjs-plugin-annotation';

function toTitleCase(str) {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

Chart.plugins.register(ChartAnnotation);

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];
let stats = ['savings', 'wages', 'baseWages', 'debt', 'expenses'];
let colors = ['#34d394', '#0000ff', '#20a1f7', '#ff0000', '#f79220'];
let eventSymbols = {
  'hired': '🛠️',
  'enrolled': '📚',
  'graduated': '🎓'
};
let eventOffsets = {
  'hired': 0,
  'enrolled': 20,
  'graduated': 20
}

function createChart(main, data) {
  const tooltip = document.getElementById('chart-tooltip');
  let canvas = document.createElement('canvas');

  data['expenses'] = data['expenses'].map(d => d.living + d.debt);
  data['debt'] = data['debt'].map(d => {
    return d.reduce((acc, v) => acc + v.remaining, 0);
  });

  main.appendChild(canvas);
  let chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: [...Array(data['savings'].length)].map((_, i) => `${months[(i%12)]} ${config.startYear + Math.floor(i/12)}`),
      datasets: stats.map((k, i) => {
        return {
          label: k,
          fill: false,
          borderWidth: 1,
          pointRadius: 0,
          backgroundColor: colors[i],
          borderColor: colors[i],
          data: data[k].map(v => Math.round(v))
        };
      })
    },
    options: {
      animation: {
        duration: 0
      },
      tooltips: {
        mode: 'index',
        position: 'nearest',
        callbacks: {
          label: function(item, data) {
            let label = data.datasets[item.datasetIndex].label || '';
            return `${label}: $${parseInt(item.value).toLocaleString()}`
          }
        }
      },
      scales: {
        xAxes: [{
          gridLines: {
              display:false
          }
        }],
        yAxes: [{
          gridLines: {
              display:false
          }
        }]
      },
      legend: {
        labels: {
          boxWidth: 2,
          fontSize: 9,
          fontFamily: 'monospace'
        }
      },
      annotation: {
        events: ['mouseover', 'mouseleave', 'mousemove'],
        annotations: data.events.map((e) => {
          let time = `${months[e.ev.time.month]} ${config.startYear + e.ev.time.year}`;
          let label = {
            backgroundColor: 'rgba(0,0,0,0)',
            fontFamily: "sans-serif",
            fontSize: 11,
            fontStyle: "normal",
            xPadding: 6,
            yPadding: 4,
            cornerRadius: 0,
            position: "top",
            xAdjust: 0,
            yAdjust: eventOffsets[e.type],
            enabled: true,
            content: eventSymbols[e.type]
          };
          return {
            type: 'line',
            mode: 'vertical',
            scaleID: "x-axis-0",
            value: time,
            borderColor: 'rgba(0,0,0,0.1)',
            borderWidth: 2,
            label: label,
            onMouseover: function(ev) {
              tooltip.style.display = 'block';
              tooltip.style.left = `${ev.clientX}px`;
              tooltip.style.top = `${ev.clientY}px`;
              switch (e.type) {
                case 'hired':
                  tooltip.innerText = `${toTitleCase(e.type)} as ${jobs[e.ev.job].name}`;
                  break;
                case 'graduated':
                  tooltip.innerText = `${toTitleCase(e.type)}: ${education[e.ev.education+1].name}`;
                  break;
                default:
                  tooltip.innerText = e.type;
              }
            },
            onMouseleave: function() {
              tooltip.style.display = 'none';
            },
            onMousemove: function(ev) {
              tooltip.style.left = `${ev.clientX}px`;
              tooltip.style.top = `${ev.clientY}px`;
            }
          }
        })
      }
    }
  });
}

export default createChart;

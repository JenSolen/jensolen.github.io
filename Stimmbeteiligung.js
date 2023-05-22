var radialChart = null;

function startAnimation(percent){
  if (radialChart) {
    radialChart.destroy();
  }

  var options = {
    series: [percent],
    chart: {
    height: 150,
    type: 'radialBar',
    marginTop: -14,
  },
  states: {
    hover: {
        filter: {
            type: 'none',
        }
    },
},
  legend: {
    display: false,
    show: false,
 },
 
  plotOptions: {
    radialBar: {
      hollow: {
        size: '60%',
      },
      dataLabels: {
        show: true,
        value: {
          show: true,
          fontSize: '12px',
          fontWeight: 400,
          color: undefined,
          offsetY: -13,
          formatter: function (val) {
            return val + '%'
          }
        },
      }
    },
    track: {
      margin: 10,
      background: 'transparent'
    },  
},
  stroke: {
    lineCap: "round",
  },
  labels: [''],
  title: {
    text: 'Stimmbeteiligung',
    align: 'center',
    margin: 0,
    offsetX: -4,
    offsetY: 9,
    style: {
      fontSize:  '12px',
      fontWeight:  'bold',
      fontFamily:  undefined,
      color:  '#636363'
    },
  },
  };

  radialChart = new ApexCharts(document.querySelector("#radial-Chart"), options);
  
  radialChart.render();
 
}



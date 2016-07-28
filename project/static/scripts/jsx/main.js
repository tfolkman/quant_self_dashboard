var React = require('react');
var ReactDOM = require('react-dom');
var LineChart = require("react-chartjs").Line;

var TopLeftChart = React.createClass({
  render: function() {

    var chartData = {
      labels: ["January", "February", "March", "April", "May", "June", "July"],
      datasets: [
          {
              label: "My First dataset",
              fillColor: "rgba(220,220,220,0.2)",
              strokeColor: "rgba(220,220,220,1)",
              pointColor: "rgba(220,220,220,1)",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(220,220,220,1)",
              data: [1, 2, 3, 4, 5, 6, 7]
          }
      ]
    };

    return <LineChart data={chartData} width="350" height="300"/>
  }
});

ReactDOM.render(
  <TopLeftChart />,
  document.getElementById('topLeftChart')
);

var TopMidChart = React.createClass({
  render: function() {

    var chartData = {
      labels: ["January", "February", "March", "April", "May", "June", "July"],
      datasets: [
          {
              label: "My First dataset",
              fillColor: "rgba(220,220,220,0.2)",
              strokeColor: "rgba(220,220,220,1)",
              pointColor: "rgba(220,220,220,1)",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(220,220,220,1)",
              data: [3, 4, 3, 6, 5, 6, 7]
          }
      ]
    };

    return <LineChart data={chartData} width="350" height="300"/>
  }
});

ReactDOM.render(
  <TopMidChart />,
  document.getElementById('topMidChart')
);

var TopRightChart = React.createClass({
  render: function() {

    var chartData = {
      labels: ["January", "February", "March", "April", "May", "June", "July"],
      datasets: [
          {
              label: "My First dataset",
              fillColor: "rgba(220,220,220,0.2)",
              strokeColor: "rgba(220,220,220,1)",
              pointColor: "rgba(220,220,220,1)",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(220,220,220,1)",
              data: [30, 4, 3, 6, 52, 6, 1]
          }
      ]
    };

    return <LineChart data={chartData} width="350" height="300"/>
  }
});

ReactDOM.render(
  <TopRightChart/>,
  document.getElementById('topRightChart')
);
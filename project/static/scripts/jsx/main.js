var React = require('react');
var ReactDOM = require('react-dom');
var LineChart = require("react-chartjs").Line;
var Select = require('react-select');


var Dashboard = React.createClass({

    getInitialState: function() {
        return {min_vars: [], flag_vars: []};
    },

    componentDidMount: function() {
        this.loadVariables();
    },

    loadVariables: function() {
        $.ajax({
            url: "/get_variables/",
            type: 'GET',
            contentType: 'application/json;charset=UTF-8',
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({min_vars: data['min_vars'], flag_vars: data['flag_vars']});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("/get_variables/", status, err.toString());
            }.bind(this)
        });
    },

    render: function() {
      return (
        <div className="row">
            <TopLeftChart variables={this.state.min_vars}/>
        </div>
      );
    }

})

var TopLeftChart = React.createClass({

    getInitialState: function() {
        return {chartData: [], dataType: [], dataColumn: []};
    },

    componentDidMount: function() {
        var dataType = "ALL";
        var dataColumn = "min_league"; 
        this.loadChartData(dataType, dataColumn);
    },

    loadChartData: function(dataType, dataColumn) {
        $.ajax({
            url: "/get_line_chart_data/",
            type: 'POST',
            data: JSON.stringify({'dataType': dataType, 'dataColumn': dataColumn}),
            contentType: 'application/json;charset=UTF-8',
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({chartData: data, dataType: dataType, dataColumn: dataColumn});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("/get_line_chart_data/", status, err.toString());
            }.bind(this)
        });
    },

  render: function() {
    var options = this.props.variables.map( function(variable) {
      return {value: variable, label: variable};
    });

    return (
      <div className="col-md-4">
        <LineChart data={this.state.chartData} redraw width="350" height="300"/>
        <Select name="variable-select" value={"Testing"} options={options}/>
      </div>
    );
  }
});

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

var TopRightChart = React.createClass({
  render: function() {

    var chartData = {
      labels: ["January", "February", "March", "April", "May", "June", "July"],
      datasets: [
          {
              data: [30, 4, 3, 6, 52, 6, 1]
          }
      ]
    };

    return <LineChart data={chartData} width="350" height="300"/>
  }
});

ReactDOM.render(
  <Dashboard/>,
  document.getElementById('dashboard')
);
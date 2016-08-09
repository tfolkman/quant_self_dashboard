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
        <div>
        <div className="row">
            <TopLeftChart variables={this.state.min_vars}/>
        </div>
        <div className="row">
            <TopMidChart variables={this.state.flag_vars}/>
        </div>
        </div>
      );
    }

})

var TopLeftChart = React.createClass({

    getInitialState: function() {
        return {chartData: [], currentSelect: []};
    },

    componentDidMount: function() {
        var dataColumn = "min_league"; 
        var currentSelect = {value: dataColumn, label: dataColumn}
        this.loadChartData(currentSelect);
    },

    loadChartData: function(currentSelect) {
        $.ajax({
            url: "/get_line_chart_data/",
            type: 'POST',
            data: JSON.stringify({'dataColumn': currentSelect.value}),
            contentType: 'application/json;charset=UTF-8',
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({chartData: data, currentSelect: currentSelect});
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
      <div className="col-xs-12 col-md-4">
        <LineChart data={this.state.chartData} redraw width="350" height="300"/>
        <Select name="variable-select" value={this.state.currentSelect} options={options} onChange={this.loadChartData}/>
      </div>
    );
  }
});

var TopMidChart = React.createClass({

    getInitialState: function() {
        return {tableData: [], currentSelect: []};
    },

    componentDidMount: function() {
        var dataColumn = "flag_s"; 
        var currentSelect = {value: dataColumn, label: dataColumn}
        this.loadTableData(currentSelect);
    },

    loadTableData: function(currentSelect) {
        $.ajax({
            url: "/get_table_data/",
            type: 'POST',
            data: JSON.stringify({'dataColumn': currentSelect.value}),
            contentType: 'application/json;charset=UTF-8',
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({tableData: data, currentSelect: currentSelect});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("/get_table_data/", status, err.toString());
            }.bind(this)
        });
    },

  render: function() {
    var options = this.props.variables.map( function(variable) {
      return {value: variable, label: variable};
    });

    return (
      <div className="col-xs-12 col-md-4">
        <Table dataDict={this.state.tableData}/>
        <Select name="variable-select" value={this.state.currentSelect} options={options} onChange={this.loadTableData}/>
      </div>
    );
  }
});

var Table = React.createClass({

  render: function() {
    return (
      <div>
      <h3>{this.props.dataDict.name}</h3>
      <p>Last Happened: {this.props.dataDict.last_happened}</p>
      <p>Days Since Last Happened: {this.props.dataDict.days_since}</p>
      <p>Sum last seven days: {this.props.dataDict.last_seven}</p>
      <p>Sum last thirty days: {this.props.dataDict.last_thirty}</p>
      </div>
    );
  }
})


ReactDOM.render(
  <Dashboard/>,
  document.getElementById('dashboard')
);
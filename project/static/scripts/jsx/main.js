var React = require('react');
var ReactDOM = require('react-dom');
var LineChart = require("react-chartjs").Line;
var BarChart = require("react-chartjs").Bar;
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
      var allVars = this.state.min_vars.concat(this.state.flag_vars);
      return (
        <div>
        <div className="row">
            <div className="col-md-4">
                <GoalSummary variables={allVars}/>
                <br/>
            </div>
            <div className="col-md-8">
                <div className="row">
                    <div className="col-md-6">
                        <MinLineChart variables={this.state.min_vars}/>
                    </div>
                    <div className="col-md-6">
                        <MedianBarChart variables={this.state.min_vars}/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                         <FlagTable variables={this.state.flag_vars}/>
                    </div>
                    <div className="col-md-6">
                        <MedianBarChart variables={this.state.flag_vars}/>
                    </div>
                </div>
            </div>
        </div>
        </div>
      );
    }

})

var MedianBarChart = React.createClass({

    getInitialState: function() {
        return {chartData: {labels: []}, currentSelect: [], variables: []};
    },

    componentDidMount: function() {
        var timeRange = "monthly"; 
        var currentSelect = {value: timeRange, label: timeRange}
        this.setState({currentSelect: currentSelect});
    },

    componentWillReceiveProps: function(nextProps) {
        console.log("props")
        console.log(this.state.currentSelect)
        console.log(nextProps.variables)
        this.setState({variables: nextProps.variables})
        console.log(this.state.variables)
        this.loadChartData(this.state.currentSelect, nextProps.variables);
    },

    loadChartDataSingle: function(currentSelect){
        console.log("single")
        this.loadChartData(currentSelect, this.props.variables);
    },

    loadChartData: function(currentSelect, variables) {
        console.log("ajax")
        console.log(this.state.variables)
        $.ajax({
            url: "/get_medians/",
            type: 'POST',
            data: JSON.stringify({'dataColumns': variables, 'timeRange': currentSelect.value}),
            contentType: 'application/json;charset=UTF-8',
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({chartData: data, currentSelect: currentSelect});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("/get_medians/", status, err.toString());
            }.bind(this)
        });
    },

  render: function() {
    var variables = ['monthly', 'weekly'];
    var options = variables.map( function(variable) {
      return {value: variable, label: variable};
    });

      console.log(this.state.chartData)
    return (
      <div>
        <BarChart data={this.state.chartData} redraw width="350" height="300"/>
        <Select name="flag-median-select" value={this.state.currentSelect} options={options} onChange={this.loadChartDataSingle}/>
      </div>
    );
  }
});

var MinLineChart = React.createClass({

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
      <div>
        <LineChart data={this.state.chartData} redraw width="350" height="300"/>
        <Select name="variable-select" value={this.state.currentSelect} options={options} onChange={this.loadChartData}/>
      </div>
    );
  }
});

var FlagTable = React.createClass({

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
      <div>
        <Table dataDict={this.state.tableData}/>
        <Select name="variable-select" value={this.state.currentSelect} options={options} onChange={this.loadTableData}/>
      </div>
    );
  }
});

var GoalSummary = React.createClass({
    getInitialState: function() {
        return {graphData: [], currentSelect: [], remaining: ''};
    },

    componentDidMount: function() {
        var dataColumn = "min_study"; 
        var currentSelect = {value: dataColumn, label: dataColumn}
        this.loadData(currentSelect);
    },

    loadData: function(currentSelect) {
        $.ajax({
            url: "/get_goal_data/",
            type: 'POST',
            data: JSON.stringify({'dataColumn': currentSelect.value}),
            contentType: 'application/json;charset=UTF-8',
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({graphData: data.graph, currentSelect: currentSelect,
                    remaining: data.remaining});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("/get_goal_data/", status, err.toString());
            }.bind(this)
        });
    },

    render: function() {
        var options = this.props.variables.map( function(variable) {
          return {value: variable, label: variable};
        });
        return (
            <div>
            <h2>Goal Summary</h2>
            <p>{this.state.remaining}</p>
            <Select name="goal-select" value={this.state.currentSelect} options={options} onChange={this.loadData}/>
            <LineChart data={this.state.graphData} redraw width="350" height="300"/>
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
      <p>Best Week: {this.props.dataDict.best_seven}</p>
      <p>Best Month: {this.props.dataDict.best_month}</p>
      </div>
    );
  }
});


ReactDOM.render(
  <Dashboard/>,
  document.getElementById('dashboard')
);
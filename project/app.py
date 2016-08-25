from flask import Flask, render_template, request
from pandas import read_csv, to_datetime
from json import dumps, load
import numpy as np
import datetime
import os
from copy import deepcopy

app = Flask(__name__)

APP_ROOT = os.path.dirname(os.path.abspath(__file__))
APP_STATIC = os.path.join(APP_ROOT, 'static')
DATA = os.path.join(APP_STATIC, 'data/data.csv')
GOALS = os.path.join(APP_STATIC, 'data/goals.json')
BASE_CHART_OPTIONS = {'fillColor': "rgba(220,220,220,0.2)",
              'strokeColor': "rgba(220,220,220,1)",
              'pointColor': "rgba(220,220,220,1)",
              'pointStrokeColor': "#fff",
              'pointHighlightFill': "#fff",
              'pointHighlightStroke': "rgba(220,220,220,1)"}

df = read_csv(DATA)
df = df.fillna(0)
df.index = to_datetime(df['date'])

columns = df.columns
min_vars = []
flag_vars = []
variable_dict = {}
for c in columns:
    if 'min' in c:
        min_vars.append(c)
    elif 'flag' in c:
        flag_vars.append(c)
variable_dict['min_vars'] = min_vars
variable_dict['flag_vars'] = flag_vars
max_days = df.shape[0]

with open(GOALS) as data_file:    
	goal_dict = load(data_file)


@app.route('/get_variables/', methods=['GET'])
def get_variables():
	return dumps(variable_dict)


@app.route('/get_line_chart_data/', methods=['POST'])
def get_line_chart_data():
	data_column = request.json['dataColumn']
	datasets_dict = BASE_CHART_OPTIONS
	datasets_dict['data'] = df[data_column].values[-min(30, max_days):].tolist()
	return_dict = {
		'labels': df.date.values[-min(30, max_days):].tolist(),
		'datasets': [ datasets_dict ]
	}
	return dumps(return_dict)


@app.route('/get_goal_data/', methods=['POST'])
def get_goal_data():
	data_column = request.json['dataColumn']
	interval = goal_dict[data_column]['interval']
	interval_df = df[data_column].resample(interval, how='sum')
	max_value = min(12, interval_df.shape[0])
	datasets_dict = BASE_CHART_OPTIONS
	datasets_dict['data'] = interval_df.values[-max_value:].tolist()
	datasets_dict2 = deepcopy(BASE_CHART_OPTIONS)
	get_min_max_line(datasets_dict2, goal_dict[data_column]['type'],
		goal_dict[data_column]['value'], max_value)
	dates = [x.strftime('%Y-%m-%d') for x in interval_df.index.date]
	dates = dates[-max_value:]
	graph_dict = {
		'labels': dates,
		'datasets': [ datasets_dict, datasets_dict2 ]
	}
	return_dict = {
		'graph': graph_dict,
		'remaining': get_remaining(datasets_dict['data'][-1],
			goal_dict[data_column]['value'], goal_dict[data_column]['type']),
		'days_left': days_left(goal_dict[data_column]['interval']),
		'arrow': get_arrow(goal_dict[data_column]['type'],
			datasets_dict['data'][-2] - datasets_dict['data'][-3])
	}
	return dumps(return_dict)


def days_left(type):
	print(type)
	today = datetime.date.today()
	if type.lower() == 'w':
		return datetime.timedelta( (7-today.weekday()) % 7 ).days


def get_arrow(type, change):
	if change > 0 and type.lower() == 'min':
		return "fa fa-arrow-up fa-2x green-arrow"
	elif change > 0 and type.lower() == 'max':
		return "fa fa-arrow-up fa-2x red-arrow"
	elif change <= 0 and type.lower() == 'max':
		return "fa fa-arrow-down fa-2x green-arrow"
	elif change <= 0 and type.lower() == 'min':
		return "fa fa-arrow-down fa-2x red-arrow"


def get_remaining(current, goal, type):
	if type.lower() == 'min':
		return get_remaining_min(current, goal)
	else:
		return get_remaining_max(current, goal)


def get_remaining_min(current, goal):
	if current >= goal:
		return "You've reached your goal for this period!"
	else:
		return "You have {0} more to reach goal".format(int(goal)-current)


def get_remaining_max(current, goal):
	if current >= goal:
		return "You've already broken your goal for this period!"
	else:
		return "Don't do more than {0} more to reach goal".format(int(goal)-current)


def get_min_max_line(datasets_dict, type, value, n):
	datasets_dict['data'] = [value] * n
	datasets_dict['fillColor'] = "rgba(220,220,220,0)"
	datasets_dict['pointColor'] = "rgba(220,220,220,0)"
	datasets_dict['pointStrokeColor'] = "rgba(220,220,220,0)"
	if type.lower() == 'min':
		datasets_dict['strokeColor'] = "rgba(0,100,0,1)"
	elif type.lower() == 'max':
		datasets_dict['strokeColor'] = "rgba(100,0,0,1)"


@app.route('/get_table_data/', methods=['POST'])
def get_table_data():
	data_column = request.json['dataColumn']
	last_happened = df[df[data_column] == 1].iloc[-1]['date']
	last_happened_date = datetime.datetime.strptime(last_happened, "%m/%d/%Y").date()
	now_date = datetime.datetime.now().date()
	days_since = (now_date - last_happened_date).days
	last_seven = np.sum(df[data_column].values[-min(7, max_days):])
	last_thirty = np.sum(df[data_column].values[-min(30, max_days):])
	monthly_best = df[data_column].resample('M', how='sum').max()
	weekly_best = df[data_column].resample('W', how='sum').max()
	return_dict = {'last_happened': last_happened,
					'name': data_column.split("_")[1].upper(),
					'days_since': days_since,
					'last_seven': last_seven,
					'best_seven': weekly_best,
					'best_month': monthly_best,
					'last_thirty': last_thirty}
	return dumps(return_dict)


@app.route('/get_medians/', methods=['POST'])
def get_medians():
	data_columns = request.json['dataColumns']
	time_range = request.json['timeRange']
	if 'week' in time_range:
		group_by = "W"
	else:
		group_by = "M"
	medians = df[data_columns].resample(group_by, how='sum').median()
	medians.sort(ascending=False)
	datasets_dict = BASE_CHART_OPTIONS
	datasets_dict['data'] = medians.values.tolist()
	return_dict = {
		'labels': medians.index.tolist(),
		'datasets': [ datasets_dict ]
	}
	return dumps(return_dict)


@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)

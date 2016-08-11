from flask import Flask, render_template, request
from pandas import read_csv, to_datetime
from json import dumps
import numpy as np
import datetime
import os

app = Flask(__name__)

APP_ROOT = os.path.dirname(os.path.abspath(__file__))
APP_STATIC = os.path.join(APP_ROOT, 'static')
DATA = os.path.join(APP_STATIC, 'data/data.csv')
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


@app.route('/get_variables/', methods=['GET'])
def get_variables():
	return dumps(variable_dict)


@app.route('/get_line_chart_data/', methods=['POST'])
def get_line_chart_data():
	data_column = request.json['dataColumn']
	datasets_dict = BASE_CHART_OPTIONS
	datasets_dict['data'] = df[data_column].values[-min(30, max_days):].tolist()
	return_dict = {
		'labels': df.date.values.tolist(),
		'datasets': [ datasets_dict ]
	}
	return dumps(return_dict)


@app.route('/get_table_data/', methods=['POST'])
def get_table_data():
	data_column = request.json['dataColumn']
	last_happened = df[df[data_column] == 1].iloc[-1]['date']
	last_happened_date = datetime.datetime.strptime(last_happened, "%m/%d/%Y").date()
	now_date = datetime.datetime.now().date()
	days_since = (now_date - last_happened_date).days
	last_seven = np.sum(df[data_column].values[-min(7, max_days):])
	last_thirty = np.sum(df[data_column].values[-min(30, max_days):])
	return_dict = {'last_happened': last_happened,
					'name': data_column.split("_")[1].upper(),
					'days_since': days_since,
					'last_seven': last_seven,
					'last_thirty': last_thirty}
	return dumps(return_dict)


@app.route('/get_medians/', methods=['POST'])
def get_medians():
	print("*********")
	data_columns = request.json['dataColumns']
	time_range = request.json['timeRange']
	print(time_range)
	print(data_columns)
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
	print(return_dict)
	return dumps(return_dict)


@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)

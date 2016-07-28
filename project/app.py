from flask import Flask, render_template
from pandas import read_csv
import os

app = Flask(__name__)

APP_ROOT = os.path.dirname(os.path.abspath(__file__))
APP_STATIC = os.path.join(APP_ROOT, 'static')
DATA = os.path.join(APP_STATIC, 'data/data.csv')

df = read_csv(DATA)
print(df.head())


@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)

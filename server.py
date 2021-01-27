from flask import Flask, render_template, send_from_directory
from flask_cors import CORS

app = Flask(__name__)

app.debug = True
"""
app.template_folder = 'some_menu_idea\\templates'
app.static_folder = 'some_menu_idea\\static'
"""
CORS(app)


@app.route('/')
def response():
    return { "MSG": "Tu jeszcze nic nie ma"}


if __name__ == "__main__":
    app.run(host="127.0.0.1", port='5000')

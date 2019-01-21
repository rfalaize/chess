# Server entry point
from flask import render_template
import connexion
import logging
from flask_cors import CORS

# Create a custom logger
logging.getLogger().setLevel(logging.INFO)

# Create handlers
c_handler = logging.StreamHandler()
c_handler.setLevel(logging.INFO)
c_format = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
c_handler.setFormatter(c_format)
logging.getLogger().addHandler(c_handler)


app = connexion.App(__name__, specification_dir='swagger/', options={"swagger_ui": True})
CORS(app.app)
app.add_api('swagger.yml')

# Routes
@app.route('/')
def home():
    return render_template('home.html')


# If we're running in stand alone mode, run the application
if __name__ == '__main__':
    port = 5000
    logging.info("Starting application on port {}...".format(port))
    app.run(host='0.0.0.0', port=port, debug=True)

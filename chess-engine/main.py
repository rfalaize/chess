# Server entry point
from flask import render_template
import connexion
import logging

# Create a custom logger
logging.getLogger().setLevel(logging.INFO)

# Create handlers
c_handler = logging.StreamHandler()
# f_handler = logging.FileHandler('file.log')
c_handler.setLevel(logging.INFO)
# f_handler.setLevel(logging.ERROR)

# Create formatters and add it to handlers
c_format = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
# f_format = logging.Formatter('%(asctime)s - %(levelname)s - %(name)s - %(message)s')
c_handler.setFormatter(c_format)
# f_handler.setFormatter(f_format)

# Add handlers to the logger
logging.getLogger().addHandler(c_handler)
# logger.addHandler(f_handler)


app = connexion.App(__name__, specification_dir='swagger/', options={"swagger_ui": True})
# Read the swagger.yml file to configure the endpoints
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

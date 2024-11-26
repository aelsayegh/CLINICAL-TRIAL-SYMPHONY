# app.py
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import os
from werkzeug.utils import secure_filename
import logging
import urllib.parse

app = Flask(__name__)
CORS(app)

# Setup logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Configure upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'datasets')
ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/datasets', methods=['GET'])
def get_datasets():
    try:
        files = []
        for f in os.listdir(app.config['UPLOAD_FOLDER']):
            if allowed_file(f):
                files.append(f)
        logger.debug(f"Found files: {files}")
        return jsonify(files)
    except Exception as e:
        logger.error(f"Error in get_datasets: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/files/view/<filename>')
def view_file(filename):
    try:
        # Decode the URL-encoded filename
        decoded_filename = urllib.parse.unquote(filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], decoded_filename)
        logger.debug(f"Attempting to read file: {file_path}")
        
        if not os.path.exists(file_path):
            # Try to find the file ignoring case
            actual_filename = next(
                (f for f in os.listdir(app.config['UPLOAD_FOLDER']) 
                 if f.lower() == decoded_filename.lower()),
                None
            )
            if actual_filename:
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], actual_filename)
            else:
                logger.error(f"File not found: {file_path}")
                return jsonify({"error": "File not found"}), 404

        # Read file based on extension with different encodings
        if decoded_filename.lower().endswith('.csv'):
            try:
                # Try UTF-8 first
                df = pd.read_csv(file_path, encoding='utf-8')
            except UnicodeDecodeError:
                try:
                    # Try UTF-16 if UTF-8 fails
                    df = pd.read_csv(file_path, encoding='utf-16')
                except UnicodeDecodeError:
                    # Finally, try with latin-1 (which should handle most encodings)
                    df = pd.read_csv(file_path, encoding='latin-1')
        elif decoded_filename.lower().endswith(('.xlsx', '.xls')):
            df = pd.read_excel(file_path)
        else:
            return jsonify({"error": "Unsupported file format"}), 400

        # Handle NaN values and convert to Python native types
        df = df.replace({pd.NA: None, pd.NaT: None})
        df = df.where(pd.notnull(df), None)
        
        # Convert to records
        records = df.to_dict('records')
        logger.debug(f"Successfully read {len(records)} records")
        
        return jsonify(records)
        
    except Exception as e:
        logger.error(f"Error processing file {filename}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        if file and allowed_file(file.filename):
            # Clean the filename but preserve spaces
            filename = file.filename.replace('(', '_').replace(')', '_').replace(' ', '_')
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            logger.debug(f"File saved to: {filepath}")
            return jsonify({'message': 'File uploaded successfully', 'filename': filename})
        else:
            return jsonify({'error': 'File type not allowed'}), 400
            
    except Exception as e:
        logger.error(f"Error in upload_file: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

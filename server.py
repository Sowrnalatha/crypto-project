import os
import io
from flask import Flask, request, render_template, send_file, jsonify
from werkzeug.utils import secure_filename
from encrypt import encrypt_file
from decrypt import decrypt_file

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process', methods=['POST'])
def process():
    action = request.form.get('action')
    password = request.form.get('password')
    file = request.files.get('file')

    if not file or file.filename == '':
        return jsonify({'error': 'No file selected.'}), 400
    if not password:
        return jsonify({'error': 'Password is required.'}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    try:
        if action == 'encrypt':
            output_filename = encrypt_file(filepath, password)
            if not output_filename:
                return jsonify({'error': 'Encryption failed.'}), 500
                
        elif action == 'decrypt':
            output_filename = decrypt_file(filepath, password)
            if not output_filename:
                return jsonify({'error': 'Wrong password or corrupted file!'}), 400
        else:
            return jsonify({'error': 'Invalid action.'}), 400

        # The encrypt/decrypt functions save the file in the current directory
        # Because we want to stream it and then remove it to prevent clutter:
        if not os.path.exists(output_filename):
            return jsonify({'error': 'Output file not generated.'}), 500

        with open(output_filename, 'rb') as f:
            file_data = io.BytesIO(f.read())
            
        # Cleanup generated file
        if os.path.exists(output_filename):
            os.remove(output_filename)

        file_data.seek(0)
        return send_file(file_data, download_name=output_filename, as_attachment=True)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        # Cleanup uploaded file
        if os.path.exists(filepath):
            os.remove(filepath)

if __name__ == '__main__':
    app.run(debug=True, port=5000)

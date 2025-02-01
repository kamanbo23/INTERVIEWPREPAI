
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests
from transformers import pipeline

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize NLP models
sentiment_analyzer = pipeline('sentiment-analysis')

questions = [
    "Tell me about yourself.",
    "What’s your greatest strength?",
    "Describe a challenge you overcame."
]

@app.route('/get-question', methods=['GET'])
def get_question():
    return jsonify({"question": questions[0]})

@app.route('/analyze-text', methods=['POST'])
def analyze_text():
    user_answer = request.json.get('text', '')
    sentiment = sentiment_analyzer(user_answer)[0]
    return jsonify({
        "word_count": len(user_answer.split()),
        "sentiment": sentiment
    })

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    API_KEY = os.getenv('ASSEMBLYAI_API_KEY')
    audio_url = request.json.get('audio_url')
    
    headers = {'authorization': API_KEY}
    response = requests.post(
        'https://api.assemblyai.com/v2/transcript',
        json={'audio_url': audio_url},
        headers=headers
    )
    transcript_id = response.json()['id']
    
    while True:
        transcript_response = requests.get(
            f'https://api.assemblyai.com/v2/transcript/{transcript_id}',
            headers=headers
        )
        transcript = transcript_response.json()
        if transcript['status'] == 'completed':
            return jsonify({'text': transcript['text']})
        elif transcript['status'] == 'error':
            return jsonify({'error': 'Transcription failed'}), 500

if __name__ == '__main__':
    app.run(debug=True)

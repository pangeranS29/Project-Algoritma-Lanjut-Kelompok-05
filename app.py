from flask import Flask, render_template, jsonify, request
import random
from words import WORDS

app = Flask(__name__)

# Initial state to track guesses and correct word
current_word = ""
guesses = []
hint_attempts = 0  # Counter for hint attempts per word



# Greedy algorithm for guessing
def get_greedy_feedback(guess, correct_word): 
    feedback = []
    correct_letters = set(correct_word)
    
    for i, letter in enumerate(guess):
        if letter == correct_word[i]:
            feedback.append('green')  # Correct letter in the right position
        elif letter in correct_letters:
            feedback.append('yellow')  # Correct letter but in wrong position
        else:
            feedback.append('gray')  # Incorrect letter
    
    return feedback

@app.route('/')
def index():
    return render_template('index.html')


# Fungsi untuk mendapatkan hint dari deskripsi
def get_hint(description):
    if isinstance(description, list):  # Memastikan deskripsi adalah list
        return description
    return description.split('. ')
 


@app.route('/new_word', methods=['GET'])
def new_word():
    global current_word , hint_attempts
    current_word = random.choice(list(WORDS.keys())).upper()  # Pilih kata baru
    hint_attempts = 0  # Reset hint attempts for a new word
    description = WORDS[current_word.lower()]  # Dapatkan deskripsi kata
    
    return jsonify(word=current_word, description=description)

@app.route('/get_hint', methods=['GET'])
def get_hint_endpoint():
    global current_word
    description = WORDS[current_word.lower()]  # Dapatkan deskripsi kata yang sedang dimainkan
    
    # Ambil hint dari deskripsi
    hints = get_hint(description)
    
    # Cek berapa kali hint sudah digunakan
    if len(hints) > 0:
        hint = hints.pop(0)  # Ambil hint pertama
        return jsonify(hint=hint)
    
    return jsonify(hint="Tidak ada hint yang tersedia.")


@app.route('/valid_words', methods=['GET'])
def valid_words():

    return jsonify(words=WORDS)

@app.route('/check_guess', methods=['POST'])
def check_guess():
    global guesses, current_word
    
    data = request.get_json()
    guess = data.get('guess').upper()  # Get the user's guess from the frontend
    guesses.append(guess)
    
    feedback = get_greedy_feedback(guess, current_word)
    
    # Check if the guess is correct
    if guess == current_word:
        return jsonify(result="correct", feedback=feedback)
    
    return jsonify(result="continue", feedback=feedback)

if __name__ == '__main__':
    app.run(debug=True)

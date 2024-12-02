from flask import Flask, redirect, url_for, session, request
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
import os
import json
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'  # Allow HTTP for local testing

app = Flask(__name__)
app.secret_key = "chakeen"  # Replace with a secure secret key

# Path to your credentials JSON file
GOOGLE_CLIENT_SECRETS_FILE = "credentials.json"
SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.force-ssl",
    "https://www.googleapis.com/auth/youtube"
]
@app.route("/")
def index():
    return '''
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f9f9f9;
            font-family: Arial, sans-serif;
        }
        h1 {
            font-size: 2.5rem;
            color: #333;
            margin-bottom: 20px;
            text-align: center;
        }
        .container {
            text-align: center;
        }
        .signin-button {
            background-color: #FF0000;
            color: #fff;
            border: none;
            border-radius: 50px;
            padding: 15px 40px;
            font-size: 1.2rem;
            cursor: pointer;
            transition: background-color 0.3s ease, transform 0.2s ease;
            text-transform: uppercase;
            font-weight: bold;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
        }
        .signin-button:hover {
            background-color: #cc0000;
            transform: scale(1.05);
        }
        .signin-button:active {
            background-color: #b30000;
        }
    </style>
         <div class="container">
        <h1>Sign in to YouTube</h1>
        <button class="signin-button" onclick="window.location.href='/authorize'">Sign in with Google</button>
    </div>
    '''

@app.route("/authorize")
def authorize():
    flow = Flow.from_client_secrets_file(
        GOOGLE_CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=url_for("oauth2callback", _external=True, _scheme="https")
    )
    auth_url, state = flow.authorization_url(prompt="consent")
    
    # Store the 'state' in the session to use it in the callback
    session["state"] = state
    
    return redirect(auth_url)
@app.route("/oauth2callback")
def oauth2callback():
    state = session.get("state")  # Retrieve state from the session

    flow = Flow.from_client_secrets_file(
        GOOGLE_CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        state=state,
        redirect_uri=url_for("oauth2callback", _external=True, _scheme="https")
    )
    flow.fetch_token(authorization_response=request.url)
    credentials = flow.credentials

    # Save the credentials to a file or database if necessary
    with open("token.json", "w") as token_file:
        token_file.write(credentials.to_json())

    return '''
        <h2>Authentication successful!</h2>
        <p>Token saved as <code>token.json</code>. You can close this window.</p>
    '''

if __name__ == "__main__":
    app.run("0.0.0.0", 5000, debug=True)

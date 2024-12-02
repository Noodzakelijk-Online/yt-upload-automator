import streamlit as st
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.auth.transport.requests import Request
from datetime import datetime, timezone
import json
import os
import openai
from dateutil import parser
import time
from googleapiclient.http import MediaFileUpload
from googleapiclient.errors import HttpError
import speedtest
# Define scopes for uploading and accessing YouTube playlists
SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.force-ssl",
    "https://www.googleapis.com/auth/youtube"
]

# Set OpenAI API key from Streamlit secrets
openai.api_key = st.secrets["OPENAI_API_KEY"]

# Function to validate the token.json file
# def is_token_valid():
#     token_path = st.secrets["token_path"]
#     if os.path.exists(token_path):
#         try:
#             with open(token_path, "r") as token_file:
#                 token_data = json.load(token_file)
#             expiry_date = parser.parse(token_data.get("expiry", ""))
#             current_time = datetime.now(timezone.utc)
#             return expiry_date > current_time
#         except Exception as e:
#             st.error(f"Token validation error: {e}")
#     return False

def get_upload_speed():
    """
    Measure the current upload speed using Speedtest.
    Returns:
        float: Upload speed in MB/s.
    """
    try:
        st.info("Measuring upload speed...")
        stest = speedtest.Speedtest()
        stest.get_best_server()
        upload_speed = stest.upload() / (1024 * 1024)  # Convert from bits to MB
        st.success(f"Upload speed: {upload_speed:.2f} MB/s")
        return upload_speed
    except Exception as e:
        st.error(f"Failed to measure upload speed: {e}")
        return 0.0  # Default to 0 MB/s if speedtest fails

# Function to get YouTube credentials
def get_credentials():
    creds = None
    token_path = st.secrets["token_path"]
    credentials_path = st.secrets["credentials_path"]

    # Load token from token_path if it exists
    if os.path.exists(token_path):
        try:
            creds = Credentials.from_authorized_user_file(token_path, SCOPES)
        except Exception as e:
            st.error(f"Error loading credentials: {e}")
            creds = None

    # Refresh or create credentials if not valid
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
            except Exception as e:
                st.error(f"Error refreshing token: {e}")
                creds = None
        else:
            flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
            creds = flow.run_local_server(port=5000, access_type='offline')
            with open(token_path, "w") as token_file:
                token_file.write(creds.to_json())

    return creds

# Function to generate title and description using OpenAI
def generate_title_and_description(summary_text):
    prompt_description = f"Create a video description based on this summary: {summary_text}. Make sure you don't add timestamps or links in the description. Keep it the raw description, this will be added to the youtube video!"
    prompt_title = f"Generate a creative video title based on this summary: {summary_text}. Do not add quotation marks either."

    description_response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt_description}]
    )
    video_description = description_response.choices[0].message.content.strip()

    title_response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt_title}]
    )
    creative_title = title_response.choices[0].message.content.strip()

    return creative_title, video_description

# Function to list playlists from a given channel
def list_playlists(youtube, channel_id):
    playlists = []
    try:
        request = youtube.playlists().list(
            part="snippet",
            channelId=channel_id,
            maxResults=50
        )
        while request:
            response = request.execute()
            for item in response.get("items", []):
                # Ensure titles are valid
                title = item["snippet"].get("title", "").strip()
                if title:
                    playlists.append({
                        "id": item["id"],
                        "title": title,
                        "description": item["snippet"].get("description", "")
                    })
            request = youtube.playlists().list_next(request, response)
    except HttpError as e:
        st.error(f"An error occurred while retrieving playlists: {e}")
    return playlists

def get_authenticated_channel_id(youtube):
    try:
        response = youtube.channels().list(
            part="id",
            mine=True
        ).execute()
        return response["items"][0]["id"]
    except HttpError as e:
        st.error(f"Error fetching channel ID: {e}")
        return None
    
def upload_video_to_youtube(video_file_path, title, description, tags):
    """
    Uploads a video to YouTube with the given title, description, and tags.

    Args:
        video_file_path (str): The path to the video file to upload.
        title (str): The title of the video.
        description (str): The description of the video.
        tags (list): A list of tags for the video.

    Returns:
        str: The ID of the uploaded video.
    """
    try:
        # Measure upload speed in MB/s
        upload_speed_mb_per_sec = get_upload_speed()
        if not upload_speed_mb_per_sec or upload_speed_mb_per_sec <= 0:
            st.error("Failed to measure upload speed or speed too low.")
            raise ValueError("Invalid upload speed")

        # Calculate file size in MB
        file_size_mb = os.path.getsize(video_file_path) / (1024 * 1024)

        # Calculate total time required for upload
        total_time = file_size_mb / upload_speed_mb_per_sec

        # Initialize progress bar and placeholders
        progress_bar = st.progress(0)
        progress_placeholder = st.empty()
        time_placeholder = st.empty()

        # Start the timer
        start_time = time.time()

        # Set video metadata
        body = {
            "snippet": {
                "title": title,
                "description": description,
                "tags": tags,
                "categoryId": "22"  # 'People & Blogs' category
            },
            "status": {
                "privacyStatus": "unlisted",  # Set to 'unlisted' by default
                "selfDeclaredMadeForKids": False
            }
        }

        # Define the MediaFileUpload object (resumable upload)
        media = MediaFileUpload(video_file_path, mimetype="video/*", resumable=True)

        # Initiate the upload request
        request = youtube.videos().insert(
            part="snippet,status",
            body=body,
            media_body=media
        )

        # Execute the upload in chunks
        response = None
        while response is None:
            status, response = request.next_chunk()

            if status:
                # Update actual upload progress using resumable_progress
                progress = int((status.resumable_progress / media.size()) * 100)

                # Update progress bar and placeholders
                elapsed_time = time.time() - start_time
                remaining_time = max(0, total_time - elapsed_time)
                progress_bar.progress(progress)
                progress_placeholder.info(f"Upload progress: {progress}%")
                time_placeholder.info(f"Estimated time remaining: {int(remaining_time)} seconds")

            # Break when upload is complete
            if response:
                break

            # Sleep for smoother updates
            time.sleep(0.1)

        # Calculate total time taken
        total_time_taken = time.time() - start_time
        progress_placeholder.success("Upload completed successfully!")
        time_placeholder.success(f"Total time taken: {int(total_time_taken)} seconds")

        # Return the video ID
        video_id = response.get("id")
        st.success(f"Video uploaded successfully with ID: {video_id}")
        return video_id

    except HttpError as e:
        st.error(f"An error occurred while uploading the video: {e}")
        return None
    except ValueError as ve:
        st.error(f"Upload failed: {ve}")
        return None
    except Exception as ex:
        st.error(f"Unexpected error occurred: {ex}")
        return None
    
    # Use this code for simulating upload for debugging purposes
    # try:
    #     # Measure upload speed in MB/s
    #     upload_speed_mb_per_sec = get_upload_speed()
    #     if not upload_speed_mb_per_sec or upload_speed_mb_per_sec <= 0:
    #         st.error("Failed to measure upload speed or speed too low.")
    #         raise ValueError("Invalid upload speed")

    #     # Calculate file size in MB
    #     file_size_mb = os.path.getsize(video_file_path) / (1024 * 1024)

    #     # Calculate total time required for upload
    #     total_time = file_size_mb / upload_speed_mb_per_sec

    #     # Initialize progress bar and placeholders
    #     progress_bar = st.progress(0)
    #     progress_placeholder = st.empty()
    #     time_placeholder = st.empty()

    #     # Start the timer
    #     start_time = time.time()

    #     while True:
    #         # Calculate elapsed time
    #         elapsed_time = time.time() - start_time

    #         # Calculate upload progress and remaining time
    #         progress = min(int((elapsed_time / total_time) * 100), 100)
    #         remaining_time = max(0, total_time - elapsed_time)

    #         # Update progress bar and info
    #         progress_bar.progress(progress)
    #         progress_placeholder.info(f"Upload progress: {progress}%")
    #         time_placeholder.info(f"Estimated time remaining: {int(remaining_time)} seconds")

    #         # Break when upload is complete
    #         if progress >= 100:
    #             break

    #         time.sleep(0.1)  # Smooth updates

    #     # Calculate total time taken
    #     total_time_taken = time.time() - start_time
    #     progress_placeholder.success("Upload completed successfully!")
    #     time_placeholder.success(f"Total time taken: {int(total_time_taken)} seconds")

    # except ValueError as ve:
    #     st.error(f"Upload failed: {ve}")
    # except Exception as ex:
    #     st.error(f"An error occurred during upload: {ex}")
    

# Function to use ChatGPT to suggest playlists
def get_organization_suggestions(playlists, video_title):
    # Construct the prompt
    prompt = f"Suggest the most appropriate playlist for the video titled: '{video_title}'.\n\nAvailable playlists:\n"
    for playlist in playlists:
        prompt += f"Playlist: {playlist['title']}\n"
    prompt += "\nProvide your response in the format:\nPlaylist: <playlist_name>, Confidence: <confidence_level>. Make sure to include the comma and confidence level and make confidence a integer between 0 and 100."

    # Send the prompt to the AI model
    try:
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}]
        )
        response_text = response.choices[0].message.content.strip()

        # Debug: Print the AI response for validation
        st.write(f"AI Response: {response_text}")

        # Parse response for playlist name and confidence
        if "Confidence:" in response_text:
            playlist_part, confidence_part = response_text.split(", Confidence:")
            suggested_playlist = playlist_part.replace("Playlist:", "").strip()
            confidence = int(confidence_part.strip().replace('%', ''))
            return suggested_playlist, confidence
        else:
            st.warning("Confidence value not found in AI response. Assuming 0% confidence.")
            return response_text, 0
    except Exception as e:
        st.error(f"Error parsing AI response: {e}")
        return None, 0

# Function to list videos within a playlist
def list_videos_in_playlist(youtube, playlist_id):
    videos = []
    try:
        request = youtube.playlistItems().list(
            part="snippet",
            playlistId=playlist_id,
            maxResults=50
        )
        while request:
            response = request.execute()
            for item in response.get("items", []):
                videos.append({
                    "title": item["snippet"]["title"],
                    "description": item["snippet"]["description"]
                })
            request = youtube.playlistItems().list_next(request, response)
    except HttpError as e:
        st.error(f"An error occurred: {e}")
    return videos


# Function to add video to specified playlist
def add_video_to_playlist(youtube, video_id, playlist_id):
    """
    Adds a video to a specified YouTube playlist.
    Args:
        youtube: The authenticated YouTube client object.
        video_id: The ID of the video to be added to the playlist.
        playlist_id: The ID of the playlist to add the video to.

    Returns:
        The API response if successful, or None if there was an error.
    """
    try:
        request = youtube.playlistItems().insert(
            part="snippet",
            body={
                "snippet": {
                    "playlistId": playlist_id,
                    "resourceId": {
                        "kind": "youtube#video",
                        "videoId": video_id
                    }
                }
            }
        )
        response = request.execute()
        st.success(f"Video {video_id} successfully added to playlist {playlist_id}.")
        return response
    except HttpError as e:
        error_msg = e.content.decode("utf-8") if hasattr(e, "content") else str(e)
        st.error(f"Failed to add video to playlist. Error: {error_msg}")
        return None
    except Exception as e:
        st.error(f"An unexpected error occurred: {e}")
        return None


# Function to simulate processing steps with status messages
def process_video_steps():
    with st.spinner("Currently summarizing playlists..."):
        st.success("Summarizing completed.")

    with st.spinner("Currently analyzing video titles..."):
        st.success("Title analysis completed.")

    with st.spinner("Organizing playlists..."):
        st.success("Organization completed.")

    with st.spinner("Preparing recommendations..."):
        st.success("Recommendations ready.")

# Validate token; if invalid, show only the re-authentication link
# if not is_token_valid():
#     st.warning("Token is invalid or expired. Please re-authenticate by visiting https://ytsummarizer.me")
#     #wait for 5 seconds then refresh the page
#     time.sleep(5)
#     st.rerun()

def get_youtube_service():
    try:
        creds = get_credentials()
        if creds:
            return build("youtube", "v3", credentials=creds)
        else:
            st.error("Failed to initialize YouTube API service. Check your credentials.")
            st.stop()
    except Exception:
        st.warning("Token is invalid or expired. Please re-authenticate by visiting https://ytsummarizer.me")
#     #wait for 5 seconds then refresh the page
        time.sleep(5)
        st.rerun()

# Main app functionality, only accessible if authenticated and token is valid
#if "authenticated" in st.session_state and st.session_state["authenticated"]:
st.title("YouTube Video Uploader")
video_files = st.file_uploader("Choose video files", type=["mp4", "mov", "webm"], accept_multiple_files=True)

if video_files:
    youtube = build("youtube", "v3", credentials=get_credentials())
    channel_id = get_authenticated_channel_id(youtube)
    if not channel_id:
        st.error("Unable to retrieve channel ID.")
        st.stop()

    if st.button("Process and Upload Videos"):
        for video_file in video_files:
            # Save the video file locally
            with open(video_file.name, "wb") as f:
                f.write(video_file.getbuffer())

            with st.status(f"Processing {video_file.name}...", state="running") as status:
                try:
                    # Generate title and description
                    summary_text = f"Summary placeholder for {video_file.name}"
                    title, description = generate_title_and_description(summary_text)
                    st.write(f"Generated Title: {title}")
                    st.write(f"Generated Description: {description}")

                    # Retrieve playlists
                    playlists = list_playlists(youtube, channel_id)
                    if playlists:
                        playlist_id = None
                        # Get playlist suggestion and confidence
                        suggested_playlist, confidence = get_organization_suggestions(playlists, title)
                        playlist_id = next(
                                        (p['id'] for p in playlists if p['title'].strip().lower() == suggested_playlist.strip().lower()),
                                        None
                                        )
                        if confidence > 95:
                            st.success(f"Automatically adding to playlist: {suggested_playlist} (Confidence: {confidence}%)")
                            # Find playlist ID
                            playlist_id = next((p['id'] for p in playlists if p['title'] == suggested_playlist), None)
                            if not playlist_id:
                                st.error("Suggested playlist not found in the retrieved playlists.")
                        else:
                            st.warning(f"Suggested Playlist: {suggested_playlist} (Confidence: {confidence}%)")
                            user_choice = st.radio(
                                f"Do you want to add {video_file.name} to the playlist '{suggested_playlist}'?",
                                ("Yes", "No")
                            )
                            if user_choice == "Yes":
                                playlist_id = next((p['id'] for p in playlists if p['title'] == suggested_playlist), None)
                                if not playlist_id:
                                    st.error("Suggested playlist not found in the retrieved playlists.")
                            else:
                                st.info(f"Skipped adding {video_file.name} to playlist.")

                    else:
                        st.warning("No playlists found for the channel.")

                    # Upload video and get video ID
                    video_id = upload_video_to_youtube(video_file.name, title, description, tags=[])
                    if video_id:
                        status.update(label=f"Uploaded {video_file.name} successfully!", state="complete")
                        st.success(f"Video uploaded with ID: {video_id}")

                        # Add video to the playlist if playlist ID exists
                        if playlist_id:
                            print("Adding video to playlist"+playlist_id) 
                            add_video_to_playlist(youtube, video_id, playlist_id)
                            st.success(f"Video added to playlist: {suggested_playlist}")
                        if not playlist_id:
                            st.error(f"Suggested playlist '{suggested_playlist}' not found in the retrieved playlists.")
                            st.warning("Please select a playlist manually.")
                            selected_playlist = st.selectbox(
                                "Available Playlists",
                                [p['title'] for p in playlists]
                            )
                            playlist_id = next((p['id'] for p in playlists if p['title'] == selected_playlist), None)
                            if playlist_id:
                                add_video_to_playlist(youtube, video_id, playlist_id)
                                st.success(f"Video added to playlist: {selected_playlist}")
                            else:
                                st.error("Unable to find the selected playlist. Please verify your playlists.")
                    else:
                        st.error(f"Failed to upload {video_file.name}. Video ID is undefined.")

                except Exception as e:
                    status.update(label=f"Failed to process {video_file.name}. Error: {e}", state="error")

            time.sleep(2)  # Adjust sleep time as needed
            # Delete the video file after processing
            try:
                os.remove(video_file.name)
            except Exception as e:
                status.update(label=f"Failed to delete {video_file.name}. Error: {e}", state="error")
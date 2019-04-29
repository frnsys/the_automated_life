# Setup

1. Install dependencies:
    1. `npm install`
    2. `pip install -r requirements.txt`
    3. `sudo apt install redis-server`
2. Generate game data from source data:
    1. `pip install numpy pandas tqdm networkx`
    2. `python process_data.py`

# Architecture

- Flask server coordinates logging and game summary calculations, mainly as an interface to Redis
    - Aggregate game stats are calculated by Celery regularly

# Configuration

- Game options are configured in `config.js`.
- For error reporting, specify `SENTRY_DSN` in `config.py`.
- Configure Redis connection options in `config.py`.
- To add new languages, translate `lang/en.json` and save the translation file as `lang/<LANGUAGE CODE>.json`.

# Running locally

1. Ensure `redis` is running: `redis-server`
2. Run the server: `npm start`

Then visit `localhost:5000`.

To play in debug mode: `localhost:8080/?debug`

Other debug options, specified as URL params:

- `perfect`: always get hired at jobs you apply to
- `highschool`: start with a high school education
- `gameover`: immediately game over (for testing post-game results and survey)

# Adventure time!
I wanted to create a special 404 page for my home page https://csokavar.hu. The site has a few hidden items anyway and a text adventure
felt like a nice addition. I aimed to bring back the feel of the classic gamestyle for the 5 minutes one might want to spend on it.

The game starts with the mistic (or usual?) `- Ouch, that hurts! What's this darkness? Where is everyone?` question and the player is expected to figure out more about the situation.

The game is written in TypeScript, the limited parser uses the classic verb + object style. The IO is handled by a terminal emulator called [xterm.js](https://xtermjs.org/). It's not really a webapp, but I used [Create React App](https://github.com/facebook/create-react-app) to avoid playing whack-a-mole with the bundling issues that always come up at the beginning of these projects.

## Getting Started
You can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `docs` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.

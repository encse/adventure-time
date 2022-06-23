# Adventure time!
A custom 404 page - in fact a text adventure - for my home page [csokavar.hu](https://csokavar.hu). 
The site has a few hidden things to discover and a text adventure felt like a nice addition, with the hope of bringing back the feel of the classic genre for the 5 minutes one might want to spend on it.

The plot starts with the promising `Ouch, that hurts! What's this darkness? Where is everyone?` question and the player is expected to investigate the situation. 
It's a bit corny, but the whole project is meant to be a little parody and made with ❤️.
You will run into pop cultural references in every corner.

The game is written in TypeScript in a rather functional style, with immutable data structures.
State and command goes in, new state and message goes out. 
You get the idea.

The interaction follows the traditional verb + object pattern but the parser tolerates some variations.
I/O is delegated to [xterm.js](https://xtermjs.org/) for authenticity and uses ansi escape sequences to spice up the terminal-green setting.

It's not really a webapp, but I used [Create React App](https://github.com/facebook/create-react-app) to avoid playing whack-a-mole with the bundling issues that always come up at the beginning of these projects.

## Getting Started

### Hosted version

You can play it at https://404.csokavar.hu

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `docs` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.

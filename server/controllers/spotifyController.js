import express from 'express';
import bodyParser from 'body-parser';
import SpotifyWebApi from 'spotify-web-api-node';

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const credentials = {
  clientId: 'c0d3ae62e6e74f0baa142965fcaa68c6',
  clientSecret: process.env.SPOTIFY_SECRET,
  redirectUri: 'http://localhost:3000/callback',
};

const spotifyApi = new SpotifyWebApi(credentials);

router.get('/authorize', (req, res) => {
  const scopes = ['user-read-private',
  'user-read-email',
  'playlist-read-collaborative',
  'playlist-modify-private',
  'playlist-modify-public',
  'playlist-read-private',
  'user-follow-read',
  'user-top-read',
  ];
  // const redirectUri = 'http://localhost:3000/callback';
  // const clientId = 'c0d3ae62e6e74f0baa142965fcaa68c6';

  // // Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
  // const spotifyApi = new SpotifyWebApi({
  //   redirectUri,
  //   clientId,
  // });

  // Create the authorization URL
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);

  return res.status(200).send(authorizeURL);
});

router.put('/setcode', (req, res) => {
  // Retrieve an access token and a refresh token
  spotifyApi.authorizationCodeGrant(req.body.code)
    .then(
      (data) => {
        // Set the access token on the API object to use it in later calls
        spotifyApi.setAccessToken(data.body['access_token']);
        spotifyApi.setRefreshToken(data.body['refresh_token']);

        return res.status(200).json({ success: true, result: data.body['access_token'] });
      },
      (err) => {
        return res.status(200).json({ success: false, result: err });
      },
    );
});

router.get('/user', (req, res) => {
  spotifyApi.getMe()
    .then((data) => {
      return res.status(200).send(data);
    }, (err) => {
      return res.status(500).send(err);
    });
});

router.post('/generate', (req, res) => {
  var playlistId = -1;
  spotifyApi.createPlaylist(req.body.userId, req.body.playlistName, { 'public': true })
    .then((data) => {
      playlistId = data.body.id;
      addTopTracks(req.body.tracksList, playlistId);

    }, (err) => {
      console.log(err);
      return res.status(500).send(err);
    });
});

/**
 * Adds passed tracks list to passed playlist id
 */
function addTracks(playlistId, tracksList) {

  const tracks = tracksList.map(x => `spotify:track:${x.id}`);
  console.log(tracks);
  spotifyApi.addTracksToPlaylist(playlistId, tracks)
    .then((data) => {
      return data;
    }, (err) => {
      console.log(err);
      return err;
    });

  return tracks;
}

/**
 * Add top 3 tracks from each user to playlist
 */
function addTopTracks(tracksList, playlistId) {
  const tracks = [];

  for (var i = 0; i < tracksList.length; i++) {
    for (var j = 0; j < 3; j++) {
      tracks.push(tracksList[i][j]);
    }
  }

  addTracks(playlistId, tracks);
}

/**
 * Returns json object array of tracks that user's have in common
 */
function addCommonTracks() {

}

/**
 * Returns track importance
 */
function getTrackImportance(trackId, tracksList) {
  var importance = 0;

  for (var i = 0; i < tracksList.length; i++) {
    for (var j = 0; j < tracksList[i].length; j++) {
      if (tracksList[i][j].id == trackId) {
        importance += (7 - (j+1));
        break;
      }
    }
  }

  return importance;
}

/**
 * Return json object array of tracks from artists that user's have in common
 */
function addCommonArtists(artistsList) {

}

/**
 * Returns artist importance
 */
function getArtistImportance() {

}

/**
 * Returns json object array generated recommendations
 */
function addRecommendations() {

}

/**
 * Returns json object target parameters for recommendation
 */
function getTargets() {

}

/**
 * Returns json object array of top 5 artists user's have in common
 */
function getSeedArtists() {

}

export default router;

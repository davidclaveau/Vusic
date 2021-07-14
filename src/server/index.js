const express = require('express');
const request = require('request');
const morgan = require('morgan')
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const gql = require('graphql-tag');
const { buildASTSchema } = require('graphql');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

//global authToken
let authToken;


//sample database for future updates
const POSTS = [
  { author: "John Doe", body: "Hello world" },
  { author: "Jane Doe", body: "Hi, planet!" },
];

//schema generated using https://walmartlabs.github.io/json-to-simple-graphql-schema/ with JSON results from Spotify API Console
const schema = buildASTSchema(gql`
  type Query {
    posts: [Post]
    post(id: ID!): Post
    hello: String
    Artist(id:String): Artists
    topArtists: [Artists]
    topTracks: [Tracks]
    top10Tracks: [Tracks]
    relatedArtists(id:String): [Artists]
    audioFeatures(ids:String): [AudioFeatures]
    tracksAnalysis: [AudioFeatures]
    topTrackOffset(limit:String, offset:String): [Tracks]
  }

  type Post {
    id: ID
    author: String
    body: String
  }

type Images { height: Int url: String width: Int }
type Followers { href: String total: Int }
type ExternalUrls { spotify: String }
type ExternalIds { isrc: String }


type Artists {
  href: String
  id: String
  name: String
  popularity: Int
  type: String
  uri: String
  images: [Images ]
  genres: [String ]
  followers: Followers
  external_urls: ExternalUrls }

type Album {
  album_type: String
  href: String
  id: String
  name: String
  release_date: String
  release_date_precision: String
  total_tracks: Int
  type: String
  uri: String
  images: [Images]
  external_urls: ExternalUrls
  artists: [Artists]
}

type Tracks {
  disc_number: Int
  duration_ms: Int
  explicit: Boolean
  href: String
  id: String
  is_local: Boolean
  name: String
  popularity: Int
  preview_url: String
  track_number: Int
  type: String
  uri: String
  external_urls: ExternalUrls
  external_ids: ExternalIds
  available_markets: [String ]
  artists: [Artists ]
  album: Album }

  type AudioFeatures {
    danceability: Float
    energy: Float
    key: Int
    loudness: Float
    mode: Int
    speechiness: Float
    acousticness: Float
    instrumentalness: Float
    liveness: Float
    valence: Float
    tempo: Float
    type: String
    id: String
    uri: String
    track_href: String
    analysis_url: String
    duration_ms: Int
    time_signature: Int }
`);

//sample data refactor function
const mapPost = (post, id) => post && { id, ...post };

//root function holds all queries
const root = {

  //sample query
  posts: () => POSTS.map(mapPost),
  //sample query
  post: ({ id }) => mapPost(POSTS[id], id),
  //sample query
  hello: () => 'Hello world!',

  //get Artist
  Artist: async (id) => {
    const value = await new Promise(resolve => {
      request({
        url: `https://api.spotify.com/v1/artists/${id.id}`,
        method: "GET",
        headers: {
          'Authorization': 'Bearer ' + authToken
        },
        json: true
      }, function (error, response, body) {
        if (!error)
          resolve(body);
      });
    });
    return value;
  },

  //get topArtists from user profile
  topArtists: async () => {
    const value = await new Promise(resolve => {
      request({
        url: "https://api.spotify.com/v1/me/top/artists?time_range=long_term",
        method: "GET",
        headers: {
          'Authorization': 'Bearer ' + authToken
        },
        json: true
      }, function (error, response, body) {
        if (!error)
          resolve(body);
      });
    });
    return value.items;
  },

  //get topTracks from user profile
  topTracks: async () => {
    const value = await new Promise(resolve => {
      request({
        url: "https://api.spotify.com/v1/me/top/tracks?time_range=long_term",
        method: "GET",
        headers: {
          'Authorization': 'Bearer ' + authToken
        },
        json: true
      }, function (error, response, body) {
        if (!error)
          resolve(body);
      });
    });
    return value.items;
  },

  //get relatedArtists
  relatedArtists: async (args) => {
    const value = await new Promise(resolve => {
      request({
        url: `https://api.spotify.com/v1/artists/${args.id}/related-artists`,
        method: "GET",
        headers: {
          'Authorization': 'Bearer ' + authToken
        },
        json: true
      }, function (error, response, body) {
        if (!error)
          resolve(body);
      });
    });
    return value.artists;
  },

  //get audioFeatures for each Track
  audioFeatures: async (args) => {
    const value = await new Promise(resolve => {
      request({
        url: `https://api.spotify.com/v1/audio-features?ids=${args.ids}`,
        method: "GET",
        headers: {
          'Authorization': 'Bearer ' + authToken
        },
        json: true
      }, function (error, response, body) {
        if (!error)
          resolve(body);
      });
    });
    // process value here
    return value.audio_features;
  },
  top10Tracks: async () => {
    const value = await new Promise((resolve) => {
      request(
        {
          url: "https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=10",
          method: "GET",
          headers: {
            Authorization: "Bearer " + authToken,
          },
          json: true,
        },
        function (error, response, body) {
          if (!error) resolve(body);
        }
      );
    });
    // process value here
    return value.items;
  },
  tracksAnalysis: () => {
    return new Promise((resolve) => {
      request(
        {
          url: "https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=10",
          method: "GET",
          headers: {
            Authorization: "Bearer " + authToken,
          },
          json: true,
        },
        function (error, response, body) {
          if (!error) resolve(body);
        }
      );
    })
      .then((value) => {
        // process value here
        let ids = "";
        value.items.forEach((item) => {
          ids = ids + item.id + ",";
        });
        ids = ids.slice(0, ids.length - 1);
        return new Promise((resolve) => {
          request(
            {
              url: `https://api.spotify.com/v1/audio-features?ids=${ids}`,
              method: "GET",
              headers: {
                Authorization: "Bearer " + authToken,
              },
              json: true,
            },
            function (error, response, body) {
              if (!error) resolve(body);
            }
          );
        });
      })
      .then((value) => {
        // process value here
        return value.audio_features;
      });
  },
  topTrackOffset: async (args) => {
    return new Promise(resolve => {
      request({
        url: `https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=${args.limit}&offset=${args.offset}`,
        method: "GET",
        headers: {
          'Authorization': 'Bearer ' + authToken
        },
        json: true
      }, function (error, response, body) {
        if (!error)
          resolve(body);
      });
    })
    .then((value) => {
      // process value here
      return value.items;
    });
},
};

//spotify login prepare
const client_id = process.env.CLIENT_ID; // Your client id
const client_secret = process.env.CLIENT_SECRET; // Your secret
const redirect_uri = "https://invulnerable-mandarine-77316.herokuapp.com/callback"; // Your redirect uri


/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = function (length) {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const stateKey = "spotify_auth_state";

app.use(cors()).use(morgan()).use(cookieParser());
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  })
);

console.log("get ***************", app.get())

//spotify routes
app.get("/login", function (req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope =
    "user-read-private user-read-email user-read-recently-played user-top-read user-follow-read user-follow-modify playlist-read-private playlist-read-collaborative playlist-modify-public";
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state,
    })
  );
});

app.get("/callback", function (req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect(
      "/#" +
      querystring.stringify({
        error: "state_mismatch",
      })
    );
  } else {
    var authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      },
      headers: {
        Authorization:
          "Basic " +
          new Buffer(client_id + ":" + client_secret).toString("base64"),
      },
      json: true,
    };

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        // we can also pass the token to the browser to make requests from there
        authToken = body.access_token;
        res.redirect("https://invulnerable-mandarine-77316.herokuapp.com/graphs/top-artists/popularity");
      } else {
        res.redirect(
          "https://invulnerable-mandarine-77316.herokuapp.com/graphs/top-artists/popularity" +
          querystring.stringify({
            error: "invalid_token",
          })
        );
      }
    });
  }
});

app.get("/refresh_token", function (req, res) {
  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      Authorization:
        "Basic " +
        new Buffer(client_id + ":" + client_secret).toString("base64"),
    },
    form: {
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        access_token: access_token,
      });
    }
  });
});

const port = process.env.SERVER_PORT || 8000;

app.listen(port);

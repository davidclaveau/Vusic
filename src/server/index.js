const express = require('express');
const request = require('request');
const morgan = require('morgan')
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const gql = require('graphql-tag');
const { buildASTSchema } = require('graphql');

const POSTS = [
  { author: "John Doe", body: "Hello world" },
  { author: "Jane Doe", body: "Hi, planet!" },
];

const schema = buildASTSchema(gql`
  type Query {
    posts: [Post]
    post(id: ID!): Post
    hello: String
    query: [Items]
  }

  type Post {
    id: ID
    author: String
    body: String
  }

type Images { height: Int url: String width: Int }

type Followers { href: String total: Int }

type ExternalUrls { spotify: String }

type Items {
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

type AutogeneratedMainType { total: Int
  limit: Int
  offset: Int
  previous: String
  href: String
  next: String
  items: [Items ] }
`);

const mapPost = (post, id) => post && ({ id, ...post });

const root = {
  posts: () => POSTS.map(mapPost),
  post: ({ id }) => mapPost(POSTS[id], id),
  hello: () => 'Hello world!',
  query: () => {
    return new Promise(resolve => {
      request({
        url: "https://api.spotify.com/v1/me/top/artists",
        method: "GET",
        headers: {
          'Authorization': 'Bearer ' +
            'BQBRsO4hyNLrPr09sXg5uGr8d2zv25m55EqhcbzWoh-BQ3c1qYk_TL_CpPkfIEmmW-8gl4LMFJKg2NhLvWhL_MTsXzusgcnkkT7p8-8pku8jHyVPs48eEY9ggIg9rUnBLDl0Fy4jXlkGhRn_UVcMHWijaxojOL75cD5FWLSNvX3sixcYhvEiEvnJeyV6ldoco0JslxS5EID7p0lZ8wl6SNudxjSFB5LqT_Sm_40gMPuYioE-e8feCE_1p57HiyhTA9xgZBZLXOVe-QVZ5ntkWGZvoKkT_WfafSYeL99i'
        },
        json: true
      }, function (error, response, body) {
        if (!error)
          resolve(body);
      })
    }).then(value => {
      // process value here
      return value.items;
    })
  }
};

const app = express();
app.use(cors());
app.use(morgan());
app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true,
}));

const port = process.env.PORT || 4000
app.listen(port);
console.log(`Running a GraphQL API server at localhost:${port}/graphql`);

import {ApolloServer, gql} from "apollo-server";
import fetch from 'node-fetch';

let tweets = [
    {
        id:"1",
        text:"first one",
        userId: "2",
    },
    {
        id:"2",
        text:"second one",
        userId: "1",
    },
]

let users = [
    {
        id:"1",
        firstName:"nico",
        lastName:"park"
    },
    {
        id:"2",
        firstName:"hana",
        lastName:"park"
    },
]

const typeDefs = gql`
    type User {
        id:ID!
        firstName: String!
        lastName: String!

        """
        Is the sum of firstName + lastName as a string
        """
        fullName: String!
    }
    type Tweet {
        id:ID!
        text:String!
        author: User
    }
    type Query {
        allUsers:[User!]!
        allTweets: [Tweet!]!
        tweet(id: ID!): Tweet
        allMovies:[Movie!]!
        movie(id:String!): Movie
    }
    type Mutation {
        postTweet(text: String!, userId: ID!): Tweet!
        
        """
        Deletes a Tweet if found, else returns false
        """
        deleteTweet(id:ID!): Boolean!
    }
    
    """
    REST API
    """
    type Movie {
        id: Int!
        url: String!
        imdb_code: String!
        title: String!
        title_english: String!
        title_long: String!
        slug: String!
        year: Int!
        rating: Float!
        runtime: Float!
        genres: [String]!
        summary: String
        description_full: String!
        synopsis: String
        yt_trailer_code: String!
        language: String!
        background_image: String!
        background_image_original: String!
        small_cover_image: String!
        medium_cover_image: String!
        large_cover_image: String!
    }

`;

export const resolvers = {
    Query: {
        allTweets() {
            return tweets;
        },
        tweet(root, {id}) {
            return tweets.find((tweet) => tweet.id === id);
        },
        allUsers() {
            return users;
        },
        allMovies() {
            return fetch("https://yts.torrentbay.st/api/v2/list_movies.json")
                .then((res) => res.json())
                .then((json) => json.data.movies);
        },
        movie(root, {id}) {
            return fetch(`https://yts.torrentbay.st/api/v2/list_movies.json?movie_id=${id}`)
                .then((res) => res.json())
                .then((json) => json.data.movie);
        }
    },
    Mutation: {
        postTweet(root, { text, userId}) {
            const newTweet = {
                id:tweets.length + 1,
                text,
                userId,
            };
            tweets.push(newTweet);
            return newTweet;
        },
        deleteTweet(root, {id}) {
            const tweet = tweets.find((tweet) => tweet.id === id);
            if(!tweet) return false;
            tweets = tweets.filter((tweet) => tweet.id !== id);
            return true;
        },
    },
    User: {
        fullName({firstName, lastName}) {
            //fullName의 root는 users가 있다.
            return `${firstName} ${lastName}`;
        }
    },
    Tweet: {
        author({userId}) {
            return users.find((user) => user.id === userId);
        }
    }
};

const server = new ApolloServer({typeDefs, resolvers});

server.listen().then(({url}) => {
    console.log(`Running on ${url}`);
});

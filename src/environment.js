import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  // uri: 'http://183.83.216.63:8081/v1/graphql', //dev--old
  // uri : 'http://183.83.216.63:8083/v1/graphql' //QA--old
  //  uri : 'https://graphql.cyecom.com/v1/graphql'  //QA--New
  // uri: process.env.REACT_APP_GRAPHQL_URL,
  uri: "http://182.156.148.35:8081/v1/graphql", //dev--New
});

const garphqlAnonymousAuthorization =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsiYWRtaW4iXSwieC1oYXN1cmEtZGVmYXVsdC1yb2xlIjoiYWRtaW4ifX0.QeRTZ2BNghh4aCzYxW01LwhBiDVUixyukmEOZBHmx_r1LqqEaA4JfcPsiOyg5ZpEc0V2EqqydfbbQ4_whJZZF0VkXRl-uP3nKGzQDdA0h3yZqXx0NhdHAzoOcWLXsMjSf4SqKQSs8bp6l2WCj7L1du3WxfueDNrPqUCzGcFOALjfkrgkuOLqRAZWOEfiP78oihPh7nQtITFlmGz0KLSQ5U5vbHz1uKQI17CgwsL210geSCZiLRDJxu5a3EE_91DpZVBq9EllioFyzrvNaE0Y7NnRMYOQ9HFhjtaG2fQJsXwu9Lq9rueHFfvP-C1M3luHsqSfpSna4w6VjMWreSdeOA";
// export const baseUrl = process.env.REACT_APP_BASE_URL;
export const baseUrl = "http://182.156.148.35:8031/api/"; //dev
//export const baseUrl = 'http://183.83.216.63:8030/api/'  //QA--old
// export const  baseUrl = 'https://api.cyecom.com/api/' //QA--new
//http://183.83.216.63:8032

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem("token");
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token
        ? `Bearer ${token}`
        : `Bearer ${garphqlAnonymousAuthorization}`,
    },
  };
});

const defaultOptions = {
  watchQuery: {
    fetchPolicy: "no-cache",
    errorPolicy: "ignore",
  },
  query: {
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  },
};

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    addTypename: false,
  }),
  defaultOptions: defaultOptions,
});

export const avatarBrColors = [
  "--br-danger",
  "--br-dark",
  "--br-info",
  "--br-primary",
  "--br-success",
  "--br-warning",
];
//
export const modules = {
  toolbar: [["bold", "italic", "underline", "link"]],
};

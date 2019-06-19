import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';
import fetch from 'node-fetch';

export default new ApolloClient({
  ssrMode: true,
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        // eslint-disable-next-line
        graphQLErrors.map(({ message, locations, path }) => console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        ));
      }
      if (networkError) {
        // eslint-disable-next-line
        console.error(`[Network error]: ${networkError}`);
      }
    }),
    new HttpLink({
      uri: 'http://localhost:4000/graphql',
      fetchOptions: {
        headers: {
          'Content-Type': 'application/json',
        },
      },
      fetch,
    }),
  ]),
  cache: new InMemoryCache({
    addTypename: false,
  }),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache', // TODO: change later
      errorPolicy: 'all',
    },
  },
});

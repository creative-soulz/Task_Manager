import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloClient, InMemoryCache, ApolloProvider, ApolloLink,createHttpLink } from '@apollo/client';
import App from './App';
import './index.css';

const httpLink = createHttpLink({
  uri: 'http://localhost:8000/graphql',  // Your GraphQL API endpoint
  
});

const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('authToken');
  operation.setContext({
    headers: {
      authorization: token ? `JWT ${token}` : '',
    }
  });
  return forward(operation);
});

// Initialize Apollo Client
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <ApolloProvider client={client}>
    
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);

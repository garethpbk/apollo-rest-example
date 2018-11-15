import React, { Component } from 'react';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { RestLink } from 'apollo-link-rest';
import { ApolloProvider, Mutation } from 'react-apollo';
import { Router, Link } from '@reach/router';
import { loader } from 'graphql.macro';

// import components
import AllUsers from './AllUsers';
import CreateUser from './CreateUser';
import SingleUser from './SingleUser';

// import styles
import './App.css';

const restLink = new RestLink({
  uri: 'https://jsonplaceholder.typicode.com',
});

const client = new ApolloClient({
  link: restLink,
  cache: new InMemoryCache({
    dataIdFromObject: object => object.id || null,
  }),
});

const GET_USERS_QUERY = loader('../graphql/GET_USERS_QUERY.graphql');
const CREATE_USER_MUTATION = loader('../graphql/CREATE_USER_MUTATION.graphql');

class App extends Component {
  state = {
    name: '',
    username: '',
    email: '',
    address: {
      street: '',
      suite: '',
      city: '',
      zipcode: '',
      geo: {
        lat: '',
        lng: '',
      },
    },
    phone: '',
    website: '',
    company: {
      name: '',
      catchPhrase: '',
      bs: '',
    },
  };

  handleChange = (e, nested = null, doubleNested = null) => {
    const {
      target: { name, value },
    } = e;

    if (doubleNested) {
      const updateObj = { ...this.state[nested][doubleNested] };

      updateObj[name] = value;

      this.setState(prevState => ({
        [nested]: {
          ...prevState[nested],
          [doubleNested]: updateObj,
        },
      }));
    } else if (nested && !doubleNested) {
      const updateObj = { ...this.state[nested] };

      updateObj[name] = value;

      this.setState({
        [nested]: updateObj,
      });
    } else {
      this.setState({
        [name]: value,
      });
    }
  };

  createNewUser = async (e, action) => {
    e.preventDefault();

    const currentUsers = client.readQuery({ query: GET_USERS_QUERY });

    const id = currentUsers.users.length + 1;

    await action({
      variables: {
        input: {
          id,
          ...this.state,
        },
      },
    });

    this.setState({
      name: '',
      username: '',
      email: '',
      address: {
        street: '',
        suite: '',
        city: '',
        zipcode: '',
        geo: {
          lat: '',
          lng: '',
        },
      },
      phone: '',
      website: '',
      company: {
        name: '',
        catchPhrase: '',
        bs: '',
      },
    });
  };

  render() {
    return (
      <ApolloProvider client={client}>
        <div className="App">
          <header className="App-header">
            <h1>
              <Link to="/">apollo-link-rest + JSONPlaceholder!</Link>
            </h1>
          </header>
          <div className="App-container">
            <Router>
              <AllUsers path="/" />
              <SingleUser path="/:id" />
            </Router>
            <div>
              <h2>Add a New User</h2>
              <Mutation
                mutation={CREATE_USER_MUTATION}
                update={(cache, { data: { createUser } }) => {
                  const { users } = cache.readQuery({ query: GET_USERS_QUERY });
                  cache.writeQuery({ query: GET_USERS_QUERY, data: { users: users.concat([createUser]) } });
                }}
              >
                {(createUser, { data, error, loading }) => {
                  return (
                    <CreateUser
                      createUser={createUser}
                      createNewUser={this.createNewUser}
                      state={this.state}
                      handleChange={this.handleChange}
                    />
                  );
                }}
              </Mutation>
            </div>
          </div>
        </div>
      </ApolloProvider>
    );
  }
}

export default App;

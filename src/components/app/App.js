import React, { Component } from 'react';
import './App.css';

import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { RestLink } from 'apollo-link-rest';
import { ApolloProvider, Query, Mutation } from 'react-apollo';

import gql from 'graphql-tag';

const restLink = new RestLink({
  uri: 'https://jsonplaceholder.typicode.com/users',
  credentials: null,
});

const client = new ApolloClient({
  link: restLink,
  cache: new InMemoryCache(),
  connectToDevTools: true,
});

class App extends Component {
  state = {
    id: '',
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

    const currentUsers = client.readQuery({ query: GET_USERS });

    const id = currentUsers.users.length + 1;

    await action({
      variables: {
        input: {
          id,
          ...this.state,
        },
      },
    });
  };

  render() {
    const {
      name,
      username,
      email,
      address: {
        street,
        suite,
        city,
        zipcode,
        geo: { lat, lng },
      },
      phone,
      website,
      company,
      company: { catchPhrase, bs },
    } = this.state;
    return (
      <ApolloProvider client={client}>
        <div className="App">
          <header className="App-header">
            <h1>apollo-link-rest + JSONPlaceholder = happiness</h1>
          </header>
          <div className="App-container">
            <div>
              <h2>Current Users</h2>
              <Query query={GET_USERS}>
                {({ data, error, loading }) => {
                  if (loading) return 'Loading...';

                  if (error) return `Error: ${error}`;

                  return (
                    <ul>
                      {data.users.map(user => {
                        const { name, email, id } = user;
                        return <li key={email}>{`${name}, ${email}, ${id}`}</li>;
                      })}
                    </ul>
                  );
                }}
              </Query>
            </div>
            <div>
              <h2>Add a New User</h2>
              <Mutation
                mutation={CREATE_USER}
                fetchPolicy="no-cache"
                update={(cache, { data: { createUser } }) => {
                  const { users } = cache.readQuery({ query: GET_USERS });
                  cache.writeQuery({
                    query: GET_USERS,
                    data: { users: users.concat([createUser]) },
                  });
                }}
              >
                {(createUser, { data, error, loading }) => {
                  return (
                    <form onSubmit={e => this.createNewUser(e, createUser)}>
                      <h3>User Info</h3>
                      <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={name}
                        onChange={e => this.handleChange(e)}
                      />
                      <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={username}
                        onChange={e => this.handleChange(e)}
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => this.handleChange(e)}
                      />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone"
                        value={phone}
                        onChange={e => this.handleChange(e)}
                      />
                      <input
                        type="text"
                        name="website"
                        placeholder="Website"
                        value={website}
                        onChange={e => this.handleChange(e)}
                      />
                      <h3>User Address</h3>
                      <input
                        type="text"
                        name="street"
                        placeholder="Street"
                        value={street}
                        onChange={e => this.handleChange(e, 'address')}
                      />
                      <input
                        type="text"
                        name="suite"
                        placeholder="Suite"
                        value={suite}
                        onChange={e => this.handleChange(e, 'address')}
                      />
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={city}
                        onChange={e => this.handleChange(e, 'address')}
                      />
                      <input
                        type="text"
                        name="zipcode"
                        placeholder="Zip Code"
                        value={zipcode}
                        onChange={e => this.handleChange(e, 'address')}
                      />
                      <input
                        type="text"
                        name="lat"
                        placeholder="Latitude"
                        value={lat}
                        onChange={e => this.handleChange(e, 'address', 'geo')}
                      />
                      <input
                        type="text"
                        name="lng"
                        placeholder="Longitude"
                        value={lng}
                        onChange={e => this.handleChange(e, 'address', 'geo')}
                      />
                      <h3>User Company</h3>
                      <input
                        type="text"
                        name="name"
                        placeholder="Company Name"
                        value={company.name}
                        onChange={e => this.handleChange(e, 'company')}
                      />
                      <input
                        type="text"
                        name="catchPhrase"
                        placeholder="Company Catch Phrase"
                        value={catchPhrase}
                        onChange={e => this.handleChange(e, 'company')}
                      />
                      <input
                        type="text"
                        name="bs"
                        placeholder="Company BS"
                        value={bs}
                        onChange={e => this.handleChange(e, 'company')}
                      />

                      <input type="submit" value="Submit" />
                    </form>
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

const GET_USERS = gql`
  query GET_USERS {
    users @rest(type: "User", path: "") {
      id
      name
      username
      email
      # address @type(name: "Address") {
      #   street
      #   suite
      #   city
      #   zipcode
      #   geo @type(name: "Geo") {
      #     lat
      #     lng
      #   }
      # }
      # phone
      # website
      # company @type(name: "Company") {
      #   name
      #   catchPhrase
      #   bs
      # }
    }
  }
`;

const CREATE_USER = gql`
  mutation CREATE_USER {
    createUser(input: $input) @rest(type: "User", path: "", method: "POST") {
      id
      name
      username
      email
    }
  }
`;

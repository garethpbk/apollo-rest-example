import React from 'react';
import { ApolloConsumer } from 'react-apollo';
import { loader } from 'graphql.macro';

const GET_SINGLE_USER_FRAGMENT = loader('../graphql/GET_SINGLE_USER_FRAGMENT.graphql');

const SingleUser = props => {
  const { id } = props;

  const readUserFragment = client => {
    const data = client.readFragment({
      id,
      fragment: GET_SINGLE_USER_FRAGMENT,
    });

    if (!data) {
      return <h3>No data found in cache! Try visiting the home screen then returning here.</h3>;
    }

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
    } = data;

    return (
      <>
        <h3>{name}</h3>
        <table>
          <tbody>
            <tr>
              <td>Username</td>
              <td>{username}</td>
            </tr>
            <tr>
              <td>Email</td>
              <td>
                <a href={`mailto:${email}`}>{email}</a>
              </td>
            </tr>
            <tr>
              <td>Phone</td>
              <td>{phone}</td>
            </tr>
            <tr>
              <td>Address</td>
              <td>
                {street} {suite}
                <br />
                {city} {zipcode}
              </td>
            </tr>
            <tr>
              <td>Coordinates</td>
              <td>
                {lat}, {lng}
              </td>
            </tr>
            <tr>
              <td>Website</td>
              <td>
                <a href={`https://${website}`} target="_blank" rel="noopener noreferrer">
                  {website}
                </a>
              </td>
            </tr>
            <tr>
              <td>Company Name</td>
              <td>{company.name}</td>
            </tr>
            <tr>
              <td>Company Catch Phrase</td>
              <td>{catchPhrase}</td>
            </tr>
            <tr>
              <td>Company BS</td>
              <td>{bs}</td>
            </tr>
            <tr>
              <td>User ID</td>
              <td>{id}</td>
            </tr>
          </tbody>
        </table>
      </>
    );
  };

  return (
    <>
      <h2>Single User</h2>
      <ApolloConsumer>{client => readUserFragment(client)}</ApolloConsumer>
    </>
  );
};

export default SingleUser;

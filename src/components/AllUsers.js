import React from 'react';
import { Query } from 'react-apollo';
import { Link } from '@reach/router';
import { loader } from 'graphql.macro';

const GET_USERS_QUERY = loader('../graphql/GET_USERS_QUERY.graphql');

const AllUsers = () => (
  <>
    <h2>Current Users</h2>
    <ul>
      <li>
        <em>User Name, User Email, User Id</em>
      </li>
      <Query query={GET_USERS_QUERY}>
        {({ data, error, loading }) => {
          if (loading) return <li>Loading...</li>;

          if (error) return <li>{`Error! ${error}`}</li>;

          return data.users.map(user => {
            const { name, email, id } = user;
            return (
              <li key={email}>
                <Link to={`/${id}`}>{`${name}, ${email}, ${id}`}</Link>
              </li>
            );
          });
        }}
      </Query>
    </ul>
  </>
);

export default AllUsers;

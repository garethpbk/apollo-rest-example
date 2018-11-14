import React from 'react';
import { Query } from 'react-apollo';
import { loader } from 'graphql.macro';

const GET_SINGLE_USER_QUERY = loader('../graphql/GET_SINGLE_USER_QUERY.graphql');

const SingleUser = props => {
  const { id } = props;

  return (
    <>
      <h2>Single User</h2>
      <Query query={GET_SINGLE_USER_QUERY} variables={{ id }}>
        {({ data, error, loading }) => {
          if (loading) return 'Loading...';

          if (error) return `Error!: ${error}`;

          console.log(data);

          const {
            user: { id, name, email, username },
          } = data;

          return (
            <>
              <h3>{name}</h3>
              <p>{username}</p>
              <p>
                <a href={`mailto:${email}`}>{email}</a>
              </p>
              <p>{`ID #${id}`}</p>
            </>
          );
        }}
      </Query>
    </>
  );
};

export default SingleUser;

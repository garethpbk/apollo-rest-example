import React from 'react';

const CreateUser = ({ createUser, createNewUser, state, handleChange }) => {
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
  } = state;

  const createViaFetch = async () => {
    const newUserRequest = await fetch('https://jsonplaceholder.typicode.com/users', {
      method: 'POST',
      body: JSON.stringify(state),
    });

    const response = await newUserRequest.json();

    return response;
  };

  return (
    <form onSubmit={e => createNewUser(e, createUser)}>
      <h3>User Info</h3>
      <input type="text" name="name" placeholder="Name" value={name} required onChange={e => handleChange(e)} />
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={username}
        required
        onChange={e => handleChange(e)}
      />
      <input type="email" name="email" placeholder="Email" value={email} required onChange={e => handleChange(e)} />
      <input type="tel" name="phone" placeholder="Phone" value={phone} required onChange={e => handleChange(e)} />
      <input
        type="text"
        name="website"
        placeholder="Website"
        value={website}
        required
        onChange={e => handleChange(e)}
      />
      <h3>User Address</h3>
      <input
        type="text"
        name="street"
        placeholder="Street"
        value={street}
        required
        onChange={e => handleChange(e, 'address')}
      />
      <input
        type="text"
        name="suite"
        placeholder="Suite"
        value={suite}
        required
        onChange={e => handleChange(e, 'address')}
      />
      <input
        type="text"
        name="city"
        placeholder="City"
        value={city}
        required
        onChange={e => handleChange(e, 'address')}
      />
      <input
        type="text"
        name="zipcode"
        placeholder="Zip Code"
        value={zipcode}
        required
        onChange={e => handleChange(e, 'address')}
      />
      <input
        type="text"
        name="lat"
        placeholder="Latitude"
        value={lat}
        required
        onChange={e => handleChange(e, 'address', 'geo')}
      />
      <input
        type="text"
        name="lng"
        placeholder="Longitude"
        value={lng}
        required
        onChange={e => handleChange(e, 'address', 'geo')}
      />
      <h3>User Company</h3>
      <input
        type="text"
        name="name"
        placeholder="Company Name"
        value={company.name}
        required
        onChange={e => handleChange(e, 'company')}
      />
      <input
        type="text"
        name="catchPhrase"
        placeholder="Company Catch Phrase"
        value={catchPhrase}
        required
        onChange={e => handleChange(e, 'company')}
      />
      <input
        type="text"
        name="bs"
        placeholder="Company BS"
        value={bs}
        required
        onChange={e => handleChange(e, 'company')}
      />

      <button type="submit">Create New User (GraphQL)</button>
      <button onClick={() => createViaFetch()}>Create New User (Fetch)</button>
    </form>
  );
};

export default CreateUser;

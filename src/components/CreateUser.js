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
      <input type="tel" name="phone" placeholder="Phone" value={phone} onChange={e => handleChange(e)} />
      <input type="text" name="website" placeholder="Website" value={website} onChange={e => handleChange(e)} />
      <h3>User Address</h3>
      <input type="text" name="street" placeholder="Street" value={street} onChange={e => handleChange(e, 'address')} />
      <input type="text" name="suite" placeholder="Suite" value={suite} onChange={e => handleChange(e, 'address')} />
      <input type="text" name="city" placeholder="City" value={city} onChange={e => handleChange(e, 'address')} />
      <input
        type="text"
        name="zipcode"
        placeholder="Zip Code"
        value={zipcode}
        onChange={e => handleChange(e, 'address')}
      />
      <input
        type="text"
        name="lat"
        placeholder="Latitude"
        value={lat}
        onChange={e => handleChange(e, 'address', 'geo')}
      />
      <input
        type="text"
        name="lng"
        placeholder="Longitude"
        value={lng}
        onChange={e => handleChange(e, 'address', 'geo')}
      />
      <h3>User Company</h3>
      <input
        type="text"
        name="name"
        placeholder="Company Name"
        value={company.name}
        onChange={e => handleChange(e, 'company')}
      />
      <input
        type="text"
        name="catchPhrase"
        placeholder="Company Catch Phrase"
        value={catchPhrase}
        onChange={e => handleChange(e, 'company')}
      />
      <input type="text" name="bs" placeholder="Company BS" value={bs} onChange={e => handleChange(e, 'company')} />

      <button type="submit">Create New User</button>
    </form>
  );
};

export default CreateUser;

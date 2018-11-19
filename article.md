# REST Easy with Apollo Client

GraphQL is taking the web development world by storm, and along with it a whole new set of tools, practices, and packages to learn. During my experience learning GraphQL I've encountered several hurdles and questions, and from talking to others I gather that these are common for developers trying to learn the technology:

1. Where the heck do I start? Schemas, queries, resolvers, mutations, Apollo, Relay...huh?
2. I work on the front-end and have little or no control over my backend. Can I even use GraphQL?
3. I've heard about this GraphQL thing and want to try it out. What's an easy way to do give GraphQL a shot?
4. Rewriting our entire backend in GraphQL is unfeasible - I've got code to ship and deadlines to meet. Can I use GraphQL without committing to massive changes?

[Apollo Client](https://www.apollographql.com/docs/react/), a toolset by the Meteor Development Group that manages your application's data via the power of GraphQL, is a popular way to integrate GraphQL into front-end applications. One of the Apollo platform's biggest strengths is its broad set of _links_ that extends the Client's capability - kind of like middleware for GraphQL applications. Links can be chained together to shape your data exactly to your specifications, and offer powerful tools for common needs like error handling and state management.

One of Apollo Client's links offers solutions to all four of the questions above: `apollo-link-rest`, which allows existing REST API endpoints to be communicated with via GraphQL. This means you can start using GraphQL on the front-end, through Apollo Client, without any need for a GraphQL server on the back-end or any need to modify the back-end at all. It's a great way to try GraphQL without getting overwhelmed and for front-end developers who want to see what all the fuss is about. Whether or not it's suitable for full-scale production applications will depend on the team and application - if you want to have a fully GraphQL-powered application, it's generally recommended to leverage GraphQL on both ends; in this situation, `apollo-link-rest` offers a useful intermediary that can help the transition from a traditional REST setup to a GraphQL one (e.g. a front-end team doesn't have to wait for a GraphQL back-end to be functional).

Without further adue, let's take a dive into Apollo Client and see how `apollo-link-rest` can be used to manage data from a REST API in a React application. Our API will come from [JSONPlaceholder](https://jsonplaceholder.typicode.com/), which offers a mock REST API with everything you'd expect for a CRUD app, minus persistent storage. We'll use create-react-app to get our project up-and-running, and explore how Apollo Client works with React, as well as noting some issues with `apollo-link-rest` - as the project maintainers note, it's a library that's _under active development_.

The finished repo for this project can be found at [https://github.com/garethpbk/apollo-rest-example](https://github.com/garethpbk/apollo-rest-example).

## Creating The Project and Adding Dependencies

The first step is to create a new React App - commands here will use yarn:

`yarn create react-app apollo-rest-example`

Next, there's a few dependencies to add:

1. `apollo-client`

   \*the head honcho, the actual GraphQL client

2. `apollo-cache-inmemory`

   \*the recommended data store for Apollo Client 2.x

3. `apollo-link`

   \*allows usage of all the cool links to extend the client

4. `apollo-link-rest`

   \*the specific rest link

5. `graphql`

   \*the JavaScript implementation of the GraphQL specification

6. `graphql-anywhere`

   \*allows GraphQL queries to be run anywhere, without a server or schema

7. `graphql.macro`

   \*for importing .graphql files into .js files

8. `react-apollo`

   \*the React implementation of Apollo Client

9. `@reach/router`

   \*for client-side routing, of course!

Let's add them all:

`yarn add apollo-client apollo-cache-inmemory apollo-link apollo-link-rest graphql graphql-anywhere graphql.macro react-apollo @reach/router`

**Sidenote:** `graphql-tag` can be used in place of `graphql.macro` if you'd rather co-locate your queries and mutations directly in component files; I'll give examples of both. `@reach/router` is a personal preference; it doesn't matter what router is used so long as it can pass URL parameters as props.

Cool! We've got our project set up and dependencies installed.

## Project Structure and Instantiating Apollo Client

It's time to set up Apollo Client and add a REST endpoint, but first we want to clean up and organize our project structure:

1. Delete _serviceWorker.js_ and in _index.js_ remove the serviceWorker import and `serviceWorker.unregister();` - we don't need offline support for this example project.
2. In the **src** directory, create two new directories: **components** and **graphql** - if you're using `graphql-tag`, only create a components directory.
3. Move _App.js_ and _App.css_ into **components**; delete _App.test.js_ and _logo.svg_. Update the import path of the App component in _index.js_ accordingly.
4. In _App.js_, remove the logo import. Delete unneeded JSX in the return method, so that you've got something like this:

```
return (
    <div className="App">
        <header className="App-header">
            <h1>apollo-link-rest + JSONPlaceholder!</h1>
        </header>
    </div>
);
```

Our project structure should now look like this:

```
/src
    /components
        App.css
        App.js
    /graphql
    index.css
    index.js
```

Go ahead and run `yarn start` to make sure the development server starts. At this point it's a good idea to copy styling from the finished project into _index.css_ and _App.css_ - as this isn't a CSS tutorial we won't be going over that in detail.

[index.css](https://github.com/garethpbk/apollo-rest-example/blob/master/src/index.css)

[app.css](https://github.com/garethpbk/apollo-rest-example/blob/master/src/components/App.css)

Great! Let's move on to setting up Apollo Client. Open _App.js_ and add the imports needed to get an instance of Apollo Client running:

```
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { RestLink } from 'apollo-link-rest';
import { ApolloProvider } from 'react-apollo';
```

We now need to create two pieces: 1) a RestLink pointing to the REST endpoint and 2) an ApolloClient to wrap our application. Use the imports from the respective packages:

```
const restLink = new RestLink({
    uri: 'https://jsonplaceholder.typicode.com',
});
```

This link is passed into an instance of ApolloClient, along with a cache from `apollo-cache-inmemory`:

```
const client = new ApolloClient({
  link: restLink,
  cache: new InMemoryCache({
    dataIdFromObject: object => object.id || null,
  }),
});
```

We'll return to `dataIdFromObject` later - it allows customization of how objects in the cache are accessed, which will come in handy when we're looking at single entries queried from the cache.

The last part of setting up Apollo is to wrap our entire App component with the <ApolloProvider> component from `react-apollo`. It takes one prop, client, to which we pass the ApolloClient we created. The returned JSX of _App.js_ now looks like:

```
return (
    <ApolloProvider client={client}>
        <div className="App">
            <header className="App-header">
                <h1>apollo-link-rest + JSONPlaceholder!</h1>
            </header>
        </div>
    </ApolloProvider>
);
```

The <ApolloProvider> component is a lot like React's context provider component; anything that is a child of <ApolloProvider> lives within the client's context and can access the cool stuff provided by Apollo Client.

We're now ready to start building queries and getting data from the REST API into our application. This is a good time to install the [Apollo Client Chrome Devtools](https://chrome.google.com/webstore/detail/apollo-client-developer-t/jdkknkkbebbapilgoeccciglkfbmbnfm) if you haven't - a very useful Chrome extension for debugging and viewing the cache. With the application running, open up the inspector and look for the **Apollo** tab - if you see it, then your application is successfully running Apollo Client.

## Writing Queries & Using the <Query> Component

GraphQL's method of fetching data is based around _queries_, which are kind of like GET requests in a traditional REST API. Unlike GET requests, queries follow a rigid, declarative structure that tell GraphQL exactly what data needs to be returned. This fits neatly with GraphQL's strong type system - we won't get into it in detail here, but a GraphQL schema strictly defines what data types are available, and every associated query is a reflection of that schema (you may be wondering how a non-typed REST endpoint can be used with strongly-styped GraphQL - we'll find out soon).

Let's create our first query, which will be used to get data for all users from the JSONPlaceholder API. In the **graphql** directory create a file called _GET_ALL_USERS_QUERY.graphql_ - if you're using `graphql-tag` instead of `graphql.macro`, open up _App.js_ instead and bear with me.

**Sidenote:** if you're using VSCode, the [GraphQL for VSCode](https://marketplace.visualstudio.com/items?itemName=kumar-harsh.graphql-for-vscode) extension is an essential quality-of-life addon.

GraphQL queries look kind of like JSON - curly brackets ahoy. In _GET_ALL_USERS_QUERY.graphql_, write the following, and then we'll dig into it:

```
query GET_ALL_USERS_QUERY {
  users {
    id
    name
    email
  }
}
```

Congrats, you've written a GraphQL query! Take a look at the REST endpoint at [https://jsonplaceholder.typicode.com/users](https://jsonplaceholder.typicode.com/users) - the JSON of each entry here looks very similar to this query. Notice how the query only includes the first three fields - in a normal REST response the application recieves the entire chunk of JSON; with GraphQL it can request only the fields it cares about. Later on we'll add the rest of the fields to the query, but for now the first three will suffice. Let's dissect this query:

1. **query** declares that this is a query - it could also be a **mutation** or a **subscription** (we'll talk about mutations later, but this tutorial won't cover subscriptions).
2. **GET_ALL_USERS_QUERY** is the name of the query, used when we want to reference it elsewhere. You can call this whatever you want; I like to name my queries as explicitly as possible, including adding \_QUERY at the end.
3. **users** specifies the type of the data being returned (sort of - it refers specifically to a field called "users" on the root query, but for this tutorial just know that we'll get our data back in an object called "users").
4. **id, name, email** are the fields the application wants values returned for; they will match fields in a GraphQL schema, or REST API in this project.

If we were requesting data from a GraphQL server, this query would be all we need. However, since this is a REST endpoint, we need to add a **directive** that clarifies our need for `apollo-link-rest`. Let's add the `@rest` directive to our query:

```
query GET_ALL_USERS_QUERY {
	users @rest(type: "User", path: "/users") {
		id
		name
		email
	}
}
```

**SideNote:** directives can be thought of as modifiers that extend what queries, mutations, and subscriptions are capable of. They're sort of controversial in GraphQL land. If you're interested in learning more, check out [The power of GraphQL directives](https://blog.callstack.io/the-power-of-graphql-directives-81f4987fd76d) - note that the `@rest` directive in that article is distinct from the `@rest` directive we're using here from `apollo-link-rest`.

This is the magic of `apollo-link-rest` that allows a GraphQL query to mesh with an untyped REST API. The three parts of the directive:

1. **@rest** informs the query that it should run through `apollo-link-rest`.
2. **type: "User"** is a parameter that provides the query with a mock type to play nicely with GraphQL's strong typing - everything in a GraphQL schema is strongly typed, and queries and mutations need types to know what to look for, so this allows the query to pretend the REST API is also typed. Note that, like the "users" specification, you can call this type whatever you want - if _folks @rest(type: "Person", path: "/users")_ suits your fancy, go for it. The REST API doesn't know any better.
3. **path: "/users"** tells request where to look on the endpoint. As the client's base uri is _https://jsonplaceholder.typicode.com_, this tells the query to go to _https://jsonplaceholder.typicode.com/uesrs_ to fetch data.

**Sidenote:** think for a minute about how you'd do this with a traditional fetch call - you'd hit the endpoint and get the entire JSON response back, then filter on the client-side to get just the three fields you care about and store them in state. Something like this:

```
componentDidMount() {
	this.fetchUsers();
}

fetchUsers = async () => {
	const allUsers = await fetch('https://jsonplaceholder.typicode.com/users');

	const allUsersJson = await allUsers.json();

	const filteredUsers = allUsersJson.map(user => {
		const { id, name, email } = user;
		return { id, name, email };
	});

	this.setState({
		filteredUsers
	});
};
```

Apollo saves us the trouble of all this (more on the topic of client-side filtering at the end of the article). This code is included in the example repo code for demonstrative purposes.

Cool. Next let's actually run this query in React and get the data into the application. Create a new file in **components** called _AllUsers.js_ and import like so:

```
import React from 'react';
import { Query } from 'react-apollo';
import { Link } from '@reach/router';
import { loader } from 'graphql.macro';
```

Apollo Client 2.x uses the render prop pattern and has dedicated components for detailing with queries and mutations, creatively named <Query> and <Mutation>. We'll use `graphql.macro` to import the all users query into the component file:

`const GET_ALL_USERS_QUERY = loader('../graphql/GET_ALL_USERS_QUERY.graphql');`

Set up a functional component to render an unordered list that will accept data from the query - if you're familiar with render props this will feel cozy, if not it might seem a little weird. The <Query> component takes in a parameter called query, into which the all users query is plugged. Destructuring is then used to pull out three properties that reflect the state of the data being queried: data, error, and loading.

This is one of the coolest parts of Apollo Client - it provides an incredibly easy way to inform your UI what your data is doing with just a little bit of JavaScript. Here's the rest of the AllUsers component:

```
const AllUsers = () => (
  <>
    <h2>Current Users</h2>
    <ul>
      <li>
        <em>User Name, User Email, User Id</em>
      </li>
      <Query query={GET_ALL_USERS_QUERY}>
        {({ data, error, loading }) => {
          if (loading) return <li>Loading...</li>;

          if (error) return <li>{`Error!: ${error}`}</li>;

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
```

We conditionally return different JSX depending on what state the data is in. You could return a spinner component during the loading phase, and a big red flashing light if there's an error. Use your imagination, go wild. Apollo makes it easy.

If the data loads successfully and there are no errors, the data object is made available. Notice its _users_ property, which reflects what we called the type of data being returned in the query (if you called it _folks_, this would be _data.folks_). A <Link> component from `@reach/router` is set up here, as these entries will link to their respective individual user view later on.

If you're using `graphql-tag` instead of `graphql.macro` - you'll want to `import gql from 'graphql-tag'` and instead of loading the query from a separate file, declare right it in _AllUsers.js_ like so (I like to put it at the bottom, below the export):

```
const GET_ALL_USERS_QUERY = gql`
    query GET_ALL_USERS_QUERY {
	    users @rest(type: "User", path: "/users") {
		    id
		    name
		    email
	    }
    }
`
```

Last we must import _AllUsers.js_ into _App.js_, adding it as a route so that we're prepared to next render individual user components. Add `import { Router, Link } from '@reach/router'` and `import AllUsers from './AllUsers` to _App.js_, then create a <Router> component wrapping the <AllUsers> component with a path of "/". Link the header to the homepage for convenience. Add in a div with a class of _App-container_ for layout. The component JSX in _App.js_ now looks like:

```
class App extends Component {
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
            </Router>
          </div>
        </div>
      </ApolloProvider>
    );
  }
}
```

**Sidenote:** if you've never used Reach Router before, I highly recommend exploring it further at [https://reach.tech/router](https://reach.tech/router).

With a query successfully retrieving all users and rendering to the page, the application should now look like something like this:

![all-users-query](https://s3-us-west-1.amazonaws.com/random-pictures/apollo-link-rest+article/all-users-query.jpg)

Now is a great time to pop open the Apollo dev tools and explore how queried data is cached. Check out how _users_ is attached to the root query, and how each returned user object gets its own entry in the cache - this will be important for the next step. Notice how each user entry is referenced by its id number; this is a result of _dataIdFromObject_ that was set earlier in the cache (try removing that and seeing how it changes the cache).

![apollo-devtools-all-users](https://s3-us-west-1.amazonaws.com/random-pictures/apollo-link-rest+article/apollo-devtools-all-users.jpg)

You might also notice that the built-in GraphiQL interface shows a "forward is not a function" error when the dev tools are opened up. This is a bug with `apollo-link-rest` that's been around for a while; it doesn't really affect anything for our purposes, but it does have some implications for trying to run queries not using the `@rest` directive. There's an open issue about it and it may have resolution in the future. Take some time to play around with GraphiQL if you haven't seen it before, it's another great example of GraphQL tooling.

Awesome. Let's move on to our second query, with which we'll retrieve data for and render individual users. It'll be a little different this time - instead of the <Query> component, we'll utilize a GraphQL **fragment** to get data directly from the Apollo cache using an <ApolloConsumer> component.

## Nested Queries & Using GraphQL Fragments with <ApolloConsumer>

A [fragment](https://graphql.org/learn/queries/#fragments) is set of fields that can be used to pull out part of the data from something returned by a query, and to share fields between different queries/mutations/subscriptions. The difference between queries and fragments is kind of confusing and it's not always clear where a query should be used versus a fragment. In Apollo, fragments are very useful because they can be used to target bits of data that were not directly queried, but rather stored in the cache as a result of another query.

In our project, this means we can use fragments to get data from each individual user entry, even though those individual entries were never themselves queried. We run one query - to get all the fields we want for all users - and then use a fragment to access just the field data from one user at a time. Before we can do that the all users query must be expanded to include _all_ of the fields.

If you looked at the JSONPlaceholder /users endpoint earlier, you'll have seen that there are more fields than the three we've queried so far. Let's add the rest of those fields, and learn how `apollo-link-rest` deals with nested JSON data in the process. Add the following to _GET_ALL_USERS_QUERY.graphql_ (or in the const if you're using `graphql-tag`):

```
query GET_ALL_USERS_QUERY {
  users @rest(type: "User", path: "/users") {
    id
    name
    username
    email
    address @type(name: "Address") {
      street
      suite
      city
      zipcode
      geo @type(name: "Geo") {
        lat
        lng
      }
    }
    phone
    website
    company @type(name: "Company") {
      name
      catchPhrase
      bs
    }
  }
}
```

Boom, parity with the shape of the REST API's user data. Notice the new `@type` directive that appears in front of nested data - if you guessed that this is used to mock a type for these data, good job! This helps reinforce that GraphQL schemas are strongly typed - if we were using a schema instead of a REST API, each kind of nested data would have its own type in the schema.

There's a second way to provide types using a `typePatcher` to the RestLink object; I find the directive much easier but if you're dealing with deeply nested JSON a `typePatcher` might be the way to go - the [official documentation](https://www.apollographql.com/docs/link/links/rest.html#options.typePatcher) has more information if you want to dive deeper.

Check out the Apollo cache and see how each user entry now has _all_ of the data from the API. We're in position to start using fragments to render each user individually, along with all its data.

First let's add a route with a parameter to accomodate individual user views:

```
<Router>
	<AllUsers path="/" />
	<SingleUser path="/:id" />
</Router>
```

Create _SingleUser.js_ in **components** and import it into _App.js_, then in the **graphql** directory create _GET_SINGLE_USER_FRAGMENT.graphql_ - we'll write the fragment first:

```
fragment SingleUser on User {
  id
  name
  username
  email
  address @type(name: "Address") {
    street
    suite
    city
    zipcode
    geo @type(name: "Geo") {
      lat
      lng
    }
  }
  phone
  website
  company @type(name: "Company") {
    name
    catchPhrase
    bs
  }
}
```

Note that Apollo's documentation uses Pascal Case for fragments and uppercase Snake Case for queries and mutations, so we'll stick with that here. I stick with Snake Case for all const and filenames, though. Find what works for you.

Looks pretty similar to the full query, minus a `@rest` directive - the fragment hits the cache instead of the REST API, so no need for the directive. It's pretty self-explanatory - we want to get a fragment, called SingleUser, on an object of type User. This fragment happens to contain all of the fields that the User object does, but it can be changed to retrieve only a subset of fields as desired.

**Sidenote:** if you've read the Apollo docs you might have seen this regarding queries: _First, we try to load the query result from the Apollo cache. If it’s not in there, we send the request to the server._ So why use a fragment instead of querying an individual user, e.g. from [https://jsonplaceholder.typicode.com/users/1](https://jsonplaceholder.typicode.com/users/1)? Doing this would mean we wouldn't have to query all the fields for all the users on intial load, right? Totally right; there's three reasons for the purposes of this article why we want to use fragments: 1) fragments are useful and it's good to learn them; 2) when we create a new user with a mutation, it won't be accessible from the remote API (no persistent storage, recall), just the cache; 3) `apollo-link-rest` has some issues with queries not using the `@rest` directive and that pesky "forward is not a function" error is liable to pop up. In a production application with a real API you probably won't want to front-load all of your data, and therefore could use specific queries instead of fragments in a situation like this.

Return to _SingleUser.js_ and import the needed packages (remember to import `graphql-tag` and place the fragment in _SingleUser.js_ directly if you're using that instead of the macro):

```
import React from 'react';
import { ApolloConsumer } from 'react-apollo';
import { loader } from 'graphql.macro';

const GET_SINGLE_USER_FRAGMENT = loader('../graphql/GET_SINGLE_USER_FRAGMENT.graphql');
```

Something new! <ApolloConsumer> is another context-like component that allows its children direct access to the cache. It's used a lot in applications that utilize `apollo-link-state` to use the cache for local state management, and for us it's a convenient way to use a fragment to read a user from the cache.

Word of warning, there's going to be a lot of code in the SingleUser component; the bulk of it is JSX for laying out user data. The important bits, where we use <ApolloConsumer> to access the client and the fragment to extract data, are less than 10 lines total. Let's set up our consumer:

```
const SingleUser = props => {
	const { id } = props;

	return (
		<>
			<h2>Single User</h2>
			<ApolloConsumer>{client => readUserFragment(client)}</ApolloConsumer>
		</>
	);
};
```

The user id is extracted from a URL param provided by Reach Router, and <ApolloConsumer> uses a render prop that passes in the client. If this makes you a little uncomfortable (where is the client coming from?) you're not alone; just take it on faith that the consumer component allows automatic access to the client object. The next step is of course to write the `readUserFragment()` function:

```
const readUserFragment = client => {
	const data = client.readFragment({
		id,
		fragment: GET_SINGLE_USER_FRAGMENT,
	});

	if (!data) {
		return <h3>No data found in cache! Try visiting the home screen then returning here.</h3>
	}

	console.log(data);

	return <h3>Success!</h3>
};
```

Let's break it down: `readUserFragment()` takes in one parameter, the client, and uses the `readFragment()` method on the client object to extract the desired fields specified in the fragment from the object with the specified id. If this object isn't found in the cache, an error message is returned (recall that all of the cache data is queried from the home route). Go to the running application's home route, click on a user link, and open up the console - hopefully the data is there. Note that if the `if (!data) {}` conditional check is removed, it'll still work, the returned data will just be null - when we add JSX rendering it will crash, though, so it's important to have it in place. Unlike a <Query> component, you can call _data_ whatever you want, it's just a const set to the value of the read fragment.

This seems pretty simple, but there is quite a bit going on. It's kind of funky that even though the only query to the remote API that's been run requested **all** of the user data in one call, each indivdual user's data are accessible this way. If you looked at the cache in dev tools earlier and saw how each user got its own entry, separate from all users on the root query object, you've seen how it works: the Apollo cache normalizes the queried data and automatically gives each entry its own object - very handy. The _dataIdFromObject_ that was set earlier comes into play too - we're using ES6 property value shorthand to access the user object via `id`; if _dataIdFromObject_ is not set then you'd have to do `` id: `User:${id}` `` to properly access the object. The ability to customize how your cache is set up is a very valuable tool.

Ok, here's the big chunk of code I warned you about. Don't be afraid, it's just some destructuring and JSX to get all the user's data to show up in a table. Replace `return <h3>Success!</h3>` like so:

```
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
```

Only quirk: the _name_ property of _company_ can't be destructured since there's already a _name_ property, so it has to be accessed on the _company_ object. Here's what our final SingleUser component looks like:

![apollo-single-user-fragment](https://s3-us-west-1.amazonaws.com/random-pictures/apollo-link-rest+article/single-user-fragment.jpg)

Lookin' good. Time to move on to the last piece we'll cover, creating new users with the <Mutation> component.

## POSTing Data with Mutations

GraphQL mutations are its method of creating, updating, and deleting data. Anytime you want to change something, you'll reach for a mutation. In a REST setup you'd use POST, PUT, PATCH, or DELETE; in GraphQL it's all mutations.

Apollo 2.x offers a <Mutation> component to handle this in an application's front-end. It's a bit more complicated than the <Query> component, given that modifying data is a bit more complicated than reading it. We're going to use a mutation to create a new user that will be added to the cache (and will then be accessible with the fragment created above).

Before we proceed, another warning: there is _a lot_ of code involved here. Most of it doesn't have anything to do with mutations or GraphQL specifically, rather it's React and JSX code for dealing with input and state management. The way we're going to set up state and the change handler to control form input is not really a good one and you probably shouldn't use it in production. Form state will be intentionally set up to mirror the shape of the API, and as such involves nested state; this isn't necessarily _always_ bad in React but it can be quite difficult to deal with. I'm not going to go into much detail about state management since it isn't the focus, just trust that it will work for what we need it to do here. In the real world I'd encourage you to find a better, flatter way to structure state and package it for mutations. Maybe use something like [immer](https://github.com/mweststrate/immer).

With that out of the way, let's start by writing the mutation itself. Create _CREATE_USER_MUTATION.graphql_ in the **graphql** directory; it'll look very similar to the query from earlier:

```
mutation CREATE_USER {
  createUser(input: $input) @rest(type: "User", path: "/users", method: "POST") {
    id
    name
    username
    email
    address @type(name: "Address") {
      street
      suite
      city
      zipcode
      geo @type(name: "Geo") {
        lat
        lng
      }
    }
    phone
    website
    company @type(name: "Company") {
      name
      catchPhrase
      bs
    }
  }
}
```

Two key differences/additions from query: `createUser` takes in a variable called input (we'll roll all the data to be sent into this one variable), and the "POST" method is specified. `apollo-link-rest` defaults to the "GET" method if it's not specified, thus why we didn't have to declare this in the query. As you probably guessed this could also be "PUT" or "PATCH" or "DELETE."

Unlike the query and fragment, the mutation will have its functionality split between _App.js_ and its own file. This isn't a rule, you could just as easily keep it all in its own file or spread it across two or more dedicated files. But here we'll stick with the App component, so open up _App.js_ and load these two files:

```
const GET_ALL_USERS_QUERY = loader('../graphql/GET_ALL_USERS_QUERY.graphql');
const CREATE_USER_MUTATION = loader('../graphql/CREATE_USER_MUTATION.graphql');
```

You'll need to `import { loader } from 'graphql.macro'` as well. We'll soon see why we're also loading the `GET_ALL_USERS_QUERY` in addition to the mutation.

Here comes the ugly part. Let's add in local state and a change handler. As mentioned this is intentionally designed to mirror the API so that it doesn't have to be formatted later and can easily be spread right in to the mutation. Feel free to rip me one in the comments if you have a nicer way of handling this that preserves the nested state format.

```
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
```

Next let's bring in the <Mutation> component. Import it from `react-apollo`, so that you've got `import { ApolloProvider, Mutation } from 'react-apollo'` in _App.js_. Underneath the <Router> component, in the div with a class of _AppContainer_, add another div to wrap some text and the <Mutation> component:

```
<div>
	<h2>Add a New User</h2>
	<Mutation mutation={CREATE_USER_MUTATION}>
		{createUser => (
			<CreateUser
				createUser={createUser}
				createNewUser={this.createNewUser}
				state={this.state}
				handleChange={this.handleChange}
			/>
		)}
	</Mutation>
</div>
```

Like <Query> and `query`, <Mutation> takes in a prop called `mutation` into which a GraphQL mutation is passed. A render prop then passes `createUser` into a <CreateUser> component, which we'll create soon (it'll hold the form with inputs for setting values). As mentioned you could put the whole form here instead of its own component if you wanted, or break this whole div into its own component.

`createUser` comes from the GraphQL mutation, but we need to write the `createNewUser()` function, in which the mutation request is actually sent. Under the `handleChange()` function set up `createNewUser()`:

```
createNewUser = async (e, action) => {
    e.preventDefault();

    const currentUsers = client.readQuery({ query: GET_ALL_USERS_QUERY });

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
```

Let's go over this: first we prevent the default form action, something you've seen many times before. We use the `readQuery()` method on the client object to take a peek at the array stored in the cache of all user data, and then get its length so that we can determine the proper id to assign to the new user (if your application uses something like MongoDB that automatically creates an id, this step isn't necessary) - this is the first time we need the all user query in the mutation. Now the meat: `action` refers to `createUser` that will be passed in from the <CreateUser> component's (which itself recieves `createUser` as a prop) we'll set up next. Recall how the GraphQL createUser mutation took in one variable, called _input_ - this is where it's set. We feed it an id and the entire value of current state, from which it will create a new user. Last we clear local state to blank the form.

**Sidenote:** notice that the `client` object is freely accessible in `createNewUser()`, given that it was declared in the same file. The <SingleUser> component could have received `client` as a prop, then, instead of relying on <ApolloConsumer> to provide access. I wanted to give an example of using <ApolloConsumer>; if you're trying to access `client` in a component deep down in the component tree and don't want to prop drill, it's a lifesaver. Just like React context.

There is a lot going on here. It's ok to be confused, especially given that we're referring to things that we haven't written yet. Let's rectify that by creating _CreateUser.js_ in **components**, and take a deep breath - we've got a lot of form JSX to write:

```
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
}
```

Once again all of this is agnostic to GraphQL and Apollo, it's just a form with controlled inputs. The form's `onSubmit` action is what's important: this calls `createNewUser()` that we just wrote, and provides it the event and `createUser` action. Give it a shot - fill out the form (every field is required) and click "Create New User (GraphQL)" and see what happens.

...looks like nothing happened, other than the form blanking. Open up dev tools and look at the cache, though - you should see a new object created with id 11:

![new-user-no-query](https://s3-us-west-1.amazonaws.com/random-pictures/apollo-link-rest+article/new-user-no-query.jpg)

Check the root query object - it hasn't changed, no new user here. Only the individual user entry has been created. Try filling out the form with different values and sending it again - you'll see that a user with id 12 is not created, rather id 11 is re-written with the newer data. Thinking about how we assigned ids - by counting the length of the users object on the root query - this makes sense, as the root query isn't being updated. Lucky for us, the <Mutation> component accepts another prop called `update` that tells the client to update the root query when the mutation is successfuly submitted. Let's add it to <Mutation> in _App.js_:

```
<Mutation
	mutation={CREATE_USER_MUTATION}
	update={(cache, { data: { createUser } }) => {
		const { users } = cache.readQuery({ query: GET_ALL_USERS_QUERY });
		cache.writeQuery({ query: GET_ALL_USERS_QUERY, data: { users: users.concat([createUser]) } });
	}}
>
	{createUser => (
		<CreateUser
			createUser={createUser}
			createNewUser={this.createNewUser}
			state={this.state}
			handleChange={this.handleChange}
		/>
	)}
</Mutation>
```

Here be the second use for the `GET_ALL_USERS_QUERY` that was earlier loaded. This reads pretty easy: a successful mutation triggers a read of the query in the cache, and then writes the new user object to it through array concatenation. With this added, a second mutation will no longer overwrite the first one in the cache and all new users will be included on the root query (peep it in the dev tools cache), and, most excitingly, the results of the mutation will update the list of users in real time:

![new-user-yes-query](https://s3-us-west-1.amazonaws.com/random-pictures/apollo-link-rest+article/new-user-yes-query.jpg)

Clicking on a new user will direct to its SingleUser view, using a fragment to read directly from the cache - even though the new user doesn't exist on the remote API. Refreshing the page, of course, will wipe out the new user(s) - no persistent storage. A real REST API with a real endpoint for accepting POST requests and creating database entries from them would successfully persist your newly added user.

One more thing before we wrap up: Apollo is also good at handling POST requests made from the fetch API that don't use a mutation to create new data; it's also useful to compare how you would do things with fetch vs GraphQL. I'm not entirely sure how it works, but a new user created via fetch will be included in the root query which will update and re-fetch automatically. Add this button too _CreateUser.js_, below the submit button:

```
<button onClick={() => createViaFetch()}>Create New User (Fetch)</button>
```

Add the `createViaFetch()` function above the return:

```
const createViaFetch = async () => {
	const newUserRequest = await fetch('https://jsonplaceholder.typicode.com/users', {
		method: 'POST',
		body: JSON.stringify(state),
	});

	const response = await newUserRequest.json();

	return response;
};
```

Try adding some new user data and clicking "Create New User (Fetch)" - you'll see the same result as the GraphQL mutation, including in the dev tools cache. You can freely mix creating users with mutations and fetch, Apollo doesn't seem to care. This reinforces a big strength of Apollo and the `apollo-link-rest` package: you can start incrementally implementing GraphQL in your application without having to rewrite all of it. You could start with converting some GET requests to <Query> components without worrying about sending any data.

## Conclusion

If you've made is this far, congratulations! You now should have a good idea of how Apollo Client works and how `apollo-link-rest` makes it easy to start with GraphQL.

There's one major point to address that's been lurking under the surface this whole time that was briefly touched on earlier when discussing how the action of a <Query> component would be done with fetch and client-side filtering. And that is: if all of this is happening client-side, isn't the data filtering when requesting only some fields from a REST endpoint still being done client-side? Doesn't that defeat the one of the primary strengths of GraphQL, in that it can return only specific bits of data instead of entire JSON responses?

The answer is yes, there is still client-side filtering happening and yes, it does nullify GraphQL's key benefit in preventing overfetching. Apollo Client abstracts it away and does it for you, but somewhere under the hood the entire JSON response is still being combed through to return only the requested fields. `apollo-link-rest` is awesome, but it isn't magic, and it can't replace what an actual GraphQL server will do. The full power of GraphQL can only be realized by utilizing it on both ends of an application.

Despite this `apollo-link-rest` is still incredibly useful for a variety of reasons, and is a great way to get started with GraphQL and to start experimenting with transitioning an application from REST to GraphQL. If you've written an application with it and later have the ability to transition to a real GraphQL API, the _only_ changes you likely need to make will be swapping `restLink` for `createHttpLink` (or using `apollo-boost`), subbing in the GraphQL API uri, and removing `@rest` and `@type` directives from queries and mutations. All of the React components and ways of dealing with the cache will remain identical.

The full repository for this project can be found at:
[https://github.com/garethpbk/apollo-rest-example](https://github.com/garethpbk/apollo-rest-example)

# REST Easy with Apollo Client

GraphQL is taking the web development world by storm, and along with it a whole new set of tools, practices, and packages to learn. During my experience learning GraphQL I've encountered several hurdles and questions, and from talking to others I gather that these are common for developers trying to learn the technology:

1. Where the heck do I start? Schemas, queries, resolvers, mutations, Apollo, Relay...huh?
2. I work on the front-end and have little or no control over my backend. Can I even use GraphQL?
3. I've heard about this GraphQL thing and want to try it out. What's an easy way to do give GraphQL a shot?
4. Rewriting our entire backend in GraphQL is unfeasible - I've got code to ship and deadlines to meet. Can I use GraphQL without committing to massive changes?

[Apollo Client](https://www.apollographql.com/docs/react/), a toolset by the Meteor Development Group that manages your application's data via the power of GraphQL, is a popular way to integrate GraphQL into front-end applications. One of the Apollo platform's biggest strengths is its broad set of _links_ that extends the Client's capability - kind of like middleware for GraphQL applications. Links can be chained together to shape your data exactly to your specifications, and offer powerful tools for common needs like error handling and state management.

One of Apollo Client's links offers solutions to all four of the questions above: _apollo-link-rest_, which allows existing REST API endpoints to be communicated with via GraphQL. This means you can start using GraphQL on the front-end, through Apollo Client, without any need for a GraphQL server on the back-end or any need to modify the back-end at all. It's a great way to try GraphQL without getting overwhelmed and for front-end developers who want to see what all the fuss is about. Whether or not it's suitable for full-scale production applications will depend on the team and application - if you want to have a fully GraphQL-powered application, it's generally recommended to leverage GraphQL on both ends; in this situation, apollo-link-rest offers a useful intermediary that can help the transition from a traditional REST setup to a GraphQL one (e.g. a front-end team doesn't have to wait for a GraphQL back-end to be functional).

Without further adue, let's take a dive into Apollo Client and see how apollo-link-rest can be used to manage data from a REST API in a React application. Our API will come from [JSONPlaceholder](https://jsonplaceholder.typicode.com/), which offers a mock REST API with everything you'd expect for a CRUD app, minus persistent storage. We'll use create-react-app to get our project up-and-running, and explore how Apollo Client works with React, as well as noting some issues with apollo-link-rest - as the project maintainers note, it's a library that's _under active development_.

The finished repo for this project can be found at [https://github.com/garethpbk/apollo-rest-example](https://github.com/garethpbk/apollo-rest-example).

## Creating The Project and Adding Dependencies

The first step is to create a new React App - commands here will use yarn:

`yarn create react-app apollo-rest-example`

Next, there's a few dependencies to add:

1. `apollo-client`

   \*the head honcho, the actual GraphQL client

2. `apollo-cache-inmemory`

   \*the recommended data store for Apollo Client 2.0

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

**Notes:** `graphql-tag` can be used in place of `graphql.macro` if you'd rather co-locate your queries and mutations directly in component files; I'll give examples of both. `@reach/router` is a personal preference; it doesn't matter what router is used so long as it can pass URL parameters as props.

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

This link is passed into our instance of ApolloClient, along with the cache we create:

```
const client = new ApolloClient({
  link: restLink,
  cache: new InMemoryCache({
    dataIdFromObject: object => object.id || null,
  }),
});
```

We'll return to `dataIdFromObject` later - it allows customization of how objects in the cache are accessed, which will come in handy later when we're looking at single entries queried from the cache.

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

We're now ready to start building queries and getting data from the REST API into our application. This is a good time to install the [Apollo Client Chrome Devtools](https://chrome.google.com/webstore/detail/apollo-client-developer-t/jdkknkkbebbapilgoeccciglkfbmbnfm) if you haven't - a very useful Chrome extension for debugging and viewing the cache. With the application running, open up the inspector and look for the **Apollo** tab - if you see it, then your application is successfully running Apollo Client.

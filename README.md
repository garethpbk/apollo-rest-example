## apollo-rest-example

An example project to accompany an article about getting started with GraphQL and [apollo-link-rest](https://github.com/apollographql/apollo-link-rest).

### yarn start

to get going. Utilizes the [JSONPlaceholder API](https://jsonplaceholder.typicode.com/) for mock data.

Live deployment available at [https://apollo-link-rest-jsonplaceholder.netlify.com/](https://apollo-link-rest-jsonplaceholder.netlify.com/).

#### There is a spectre haunting this project...

...the spectre of client-side operations. Because `apollo-link-rest` involves using GraphQL without a GraphQL server, it doesn't offer the same performance benefits of preventing overfetching that offloading data processing to a server does. Just something to be aware of, as I've gotten many questions about this when speaking about the topic.

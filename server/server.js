const fs = require('fs'); 
const express = require('express');  
const {ApolloServer} = require('apollo-server-express');
const {GraphQLScalarType} = require('graphql'); 
const {Kind} = require('graphql/language'); 

let aboutMessage = "Issue Tracker API v1.0"; 

const issuesDB = [
    {
        id: 1,
        status: 'New',
        owner: 'Raven',
        effort: 5, 
        created: new Date('2019-08-15'),
        due: undefined, 
        title: 'Error in console when clicking Add'

    },
    {
        id: 2, 
        status: 'Assigned',
        owner: 'Eddie',
        effort: 14, 
        created: new Date('2019-08-16'),
        due: new Date('2019-10-30'),
        title: 'missing bottom border of panel'

    }
];

const GraphQLDate = new GraphQLScalarType({
    name: 'GraphQlDate', 
    description: 'A Date() type in GraphQL as a scalar', 
    serialize(value){
        return value.toISOString(); 
    }, 
    parseValue(value) {
        return new Date(value); 
    },
    parseLiteral(ast) {
        return (ast.kind == Kind.STRING) ? new Date(ast.value) : undefined; 
    },
}); 
const resolvers = {
    Query: {
        about: () => aboutMessage,
        issueList
    }, 
    Mutation:{
        setAboutMessage, 
        issueAdd
    },
    GraphQLDate, 
};
function setAboutMessage(_, {message}) {
    return aboutMessage = message; 
}
function issueList() {
    return issuesDB; 
}
function issueAdd(_, {issue}) {
    issue.created = new Date(); 
    issue.id = issuesDB.length + 1; 
    if (issue.status == undefined) issue.status = 'New'; 
    issuesDB.push(issue);
    return issue;
}
const server = new ApolloServer({
    typeDefs: fs.readFileSync('./server/schema.graphql', 'utf-8'),
    resolvers
}); 
const app = express();

/* first argument of .use() is the base URL of any HTTP request to match the second argument 
 is the middleware function itself */

app.use(express.static('public')); 

/* install Apollo Server as a middleware in express (Apollo is a group of
 middleware functions that deal with differnt HTTP methods differently)
 takes in a configuration object as it's argument that configures the server of which two 
 important properties are app and path */ 
server.applyMiddleware({app, path: '/graphql'}); 

app.listen(3000, () =>  {
    console.log('App started on port 3000');
}); 
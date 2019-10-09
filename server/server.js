const fs = require('fs'); 
const express = require('express');  
const {ApolloServer, UserInputError} = require('apollo-server-express');
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
        const dateValue = new Date(value); 
        return isNaN(dateValue) ? undefined : dateValue; 
        // explanation on dateValue being false: isNan() If the parameter is an object, that's done by calling the .valueOf() method of the object. In the case of Date instances that returns the timestamp 
    },
    parseLiteral(ast) {
        if (ast.kind == Kind.STRING) {
            const value = new Date(ast.value); 
            return isNaN(value) ? undefined : value; 
        }
            
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
function issueValidate(issue) {
    const errors = []; 
    if (issue.title.length < 3){
        errors.push('Field "title" must be at least 3 characters long.')
    }
    if (issue.status =='Assigned' && !issue.owner) {
        errors.push('Field "owner" is required when status is "Assigned"'); 
    }
    if (errors.length > 0) {
        throw new UserInputError('Invalid input(s)', { errors }); 
    }
}
function issueAdd(_, {issue}) {
    issueValidate(issue); 
    issue.created = new Date(); 
    issue.id = issuesDB.length + 1; 
    issuesDB.push(issue);
    return issue;
}
const server = new ApolloServer({
    typeDefs: fs.readFileSync('./server/schema.graphql', 'utf-8'),
    resolvers,
    formatError: error => {
        console.log(error);
        return error; 
    }
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
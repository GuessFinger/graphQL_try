const express = require('express');
const expressGraphql = require('express-graphql');
const app = express();

const schema = require('./schema');

app.use('/graphql', expressGraphql({
    schema,
    graphiql: true
}));

app.listen(8000, (error) => {
    if (error) {
        throw new Error(error);
    }
    console.log('***  server started ***');
});
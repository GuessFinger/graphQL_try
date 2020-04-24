const express = require('express');
const graphqlHTTP = require('express-graphql');
const {GraphQLSchema} = require('graphql');

const {queryType} = require('./query.js');

const port = 5001;
const app = express();

const schema = new GraphQLSchema({query: queryType});

// 我们在 /graphql 端点上建立一个GraphQL 服务器 他知道如何处理收到的请求 就是通过下面的代码进行建立的
// graphiql 是一个web ui 我们可以测试graphql端点

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}));


// schema 中的作用
// 指定端点 指定端点的输入字段和输入字段 端点在被调用的时候应该执行哪些操作
app.listen(port);
console.log(`GraphQL Server Running at localhost:${port}`);

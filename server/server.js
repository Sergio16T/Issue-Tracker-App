const express = require('express'); 
const app = express(); 


/* first argument of .use() is the base URL of any HTTP request to match the second argument 
 is the middleware function itself */

app.use(express.static('public')); 


app.listen(3000, () =>  {
    console.log('App started on port 3000');
}); 
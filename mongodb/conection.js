const mongoose = require('mongoose')

const url ='mongodb+srv://jobstack:KVhMCOBhAmN2DPIL@teamhexacoders.ek82ng1.mongodb.net/jobstack-database?retryWrites=true&w=majority'

mongoose.connect(url, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
}).then(() => console.log('Connected to DB')).catch((e)=> console.log('Error', e))
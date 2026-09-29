const axios = require('axios');
axios.post(undefined, {}).catch(e => {
    console.log("NAME:", e.name);
    console.log("MESSAGE:", e.message);
});

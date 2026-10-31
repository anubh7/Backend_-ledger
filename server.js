require('dotenv').config();
const app=require('./src/app');
const connectDB=require('./src/db/db');

connectDB(); //call kiya taki database connect ho jaye aur hme request mile aur hum usko process kar ske. agar database connect nahi hota hai to hme request nahi milegi aur hum usko process nahi kar ske.


app.listen(3000,()=>{
    console.log("server is running on port 3000"); 
});

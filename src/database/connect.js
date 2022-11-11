const mongoose = require("mongoose");

// for connecting to database

// for connecting to locally
mongoose.connect("mongodb://localhost:27017/users").then(()=>{
  console.log("Connection Sucessful");
}).catch((error)=>{
  console.log(error);
})



// const connectdb = async () => {
//   try {
//     const connect = await mongoose.connect(
//       ""
//     );
//     console.log(`MongoDB Connected :${connect.connection.host}`);
//   } catch (error) {
//     console.log(error);
//     process.exit(1);
//   }
// };
// connectdb();



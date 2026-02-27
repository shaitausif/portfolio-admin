// we'll use ShadCn for this project so there will be a lib folder

import mongoose from "mongoose"

type ConnectionObject = {
    isConnected? : number
}

const connection: ConnectionObject = {}

// while connecting to the database the function will return a promise and what comes into that promise doesn't matter that's why void
async function ConnectDB():Promise<void>{
    // First check for the existence of database connection if it is then use it else create new connection
    if(connection.isConnected){
        console.log('Already connected to the database')
        return
    }
   
        try {
           const db =  await mongoose.connect(process.env.MONGO_URI || '')
           console.log("Connected to DB:", db.connection.name);
            // we take the readyState of the database connection means if it's connected or not
            connection.isConnected = db.connections[0].readyState

            console.log('DB Connected Successfully')

        } catch (error) {
            
            console.log("Database connection failed: ",error)
            // exit the process gracefully because database connection was failed so remaining application is not gonna work
            process.exit(1)
        }
    
}


export default ConnectDB;  
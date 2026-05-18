import mongoose from "mongoose"
import dns from "dns"
dns.setServers(["1.1.1.1","8.8.8.8"])
export const connectDB=async()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/chatApp`)
        console.log(`\nMongodb connected and DB HOST: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("MONGODB connection FAILED ", error.message);
        process.exit(1)
    }

}
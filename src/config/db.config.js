import {prisma} from "./db.prisma.js";

export const connectToDatabase = async() => {
    try{
        await prisma.$connect();
        console.log("Connected to PostgreSQL database");
    
    } catch (error) {
        console.error("Database connection error.", error);
        process.exit(1);
    }
};
export const disconnectDatabase = async () => {
    await prisma.$disconnect();
};
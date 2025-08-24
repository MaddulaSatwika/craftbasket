import mongoose from "mongoose";
export const connectDB= async()=>{
    await mongoose.connect('mongodb+srv://satwikamaddula96:9182782455@cluster0.dfagry6.mongodb.net/ReactProject').then(()=>console.log("DB Connected"));
}
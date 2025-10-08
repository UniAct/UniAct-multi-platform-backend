import express from "express";
import dotenv from 'dotenv';
import SuperAdminRoutes from "./Routes/SuperAdminRoutes"; 

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.use("/superadmin", SuperAdminRoutes);

app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);
});
import express from "express";
import dotenv from 'dotenv';
import SuperAdminRoutes from "./Routes/SuperAdminRoutes"; 
import TenantRoutes from "./Routes/TenantRoutes";
import UniversityRoutes from "./Routes/UniversityRoutes";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT);

app.use(express.json());

app.use("/superadmin", SuperAdminRoutes);
app.use("/tenant", TenantRoutes);
app.use("/university", UniversityRoutes);

app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);
});
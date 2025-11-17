import express from "express";
import dotenv from 'dotenv';
import SuperAdminRoutes from "./Routes/SuperAdminRoutes"; 
import TenantRoutes from "./Routes/TenantRoutes";
import UniversityRoutes from "./Routes/UniversityRoutes";
import UserRoutes from "./Routes/UserRoutes";
import RBACRoutes from "./Routes/RBACRoutes";
import JSendStatus from "./Enums/Jsend";
import { StatusCodes } from "http-status-codes";
import swaggerUi from "swagger-ui-express";
import { SwaggerSpec } from "./Utils/SwaggerConfig";

dotenv.config();


const app = express();
const PORT = Number(process.env.PORT);

app.use(express.json());

app.use("/superadmin", SuperAdminRoutes);
app.use("/tenant", TenantRoutes);
app.use("/university", UniversityRoutes);
app.use("/user", UserRoutes);
app.use("/rbac" , RBACRoutes);

if (process.env.NODE_ENV?.toLowerCase() === "development") 
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(SwaggerSpec));

app.all(/.*/, (req, res) => {
    res.status(StatusCodes.NOT_FOUND).json({
        status: JSendStatus.FAIL,
        data: { route: "Route not found" }
    });
});

app.listen(PORT, () => {
    console.log(`Server Running On Port ${PORT}`);
});
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"


dotenv.config();

const app = express();

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL
  })
});

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the School Management API! Use /addSchool to add a school and /listSchools to fetch them by proximity.");
});

const addSchoolSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  latitude: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
  longitude: z.number().min(-180).max(180, "Longitude must be between -180 and 180"),
});

const listSchoolsSchema = z.object({
  latitude: z.preprocess((val) => parseFloat(val as string), z.number().min(-90).max(90)),
  longitude: z.preprocess((val) => parseFloat(val as string), z.number().min(-180).max(180)),
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRadian = (angle: number) => (Math.PI / 180) * angle;

  const R = 6371;
  const dLat = toRadian(lat2 - lat1);
  const dLon = toRadian(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadian(lat1)) * Math.cos(toRadian(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

app.post("/addSchool", async (req: Request, res: Response): Promise<any> => {
  try {
    const validatedData = addSchoolSchema.parse(req.body);
    const existingSchool = await prisma.school.findFirst({
      where: {
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
      },
    });

    if (existingSchool) {
      return res.status(409).json({
        error: "A school already exists at these exact coordinates.",
      });
    }

    const newSchool = await prisma.school.create({
      data: validatedData,
    });

    return res.status(201).json({
      message: "School added successfully",
      school: newSchool,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.issues,
      });
    }
    console.error("Error adding school:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/listSchools", async (req: Request, res: Response): Promise<any> => {
  try {
    const validatedQuery = listSchoolsSchema.parse(req.query);
    const userLat = validatedQuery.latitude;
    const userLng = validatedQuery.longitude;

    const schools = await prisma.school.findMany();

    const sortedSchools = schools
      .map((school) => {
        const distance = calculateDistance(userLat, userLng, school.latitude, school.longitude);
        return { ...school, distance };
      })
      .sort((a, b) => a.distance - b.distance);

    return res.status(200).json({
      message: "Schools retrieved successfully",
      count: sortedSchools.length,
      data: sortedSchools,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.issues,
      });
    }
    console.error("Error fetching schools:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

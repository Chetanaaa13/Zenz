import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Sample Data Generation
  const regions = ["North", "South", "East", "West", "Central"];
  const categories = ["Electronics", "Furniture", "Clothing", "Groceries", "Home Decor"];
  const products = {
    Electronics: ["Smartphone", "Laptop", "Tablet", "Headphones", "Smartwatch"],
    Furniture: ["Chair", "Table", "Sofa", "Bed", "Desk"],
    Clothing: ["T-Shirt", "Jeans", "Jacket", "Dress", "Shoes"],
    Groceries: ["Milk", "Bread", "Eggs", "Fruit", "Vegetables"],
    "Home Decor": ["Vase", "Lamp", "Rug", "Painting", "Mirror"],
  };

  const generateData = () => {
    const data = [];
    const startDate = new Date(2024, 0, 1);
    for (let i = 0; i < 1000; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + Math.floor(Math.random() * 400));
      const region = regions[Math.floor(Math.random() * regions.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const productList = products[category as keyof typeof products];
      const product = productList[Math.floor(Math.random() * productList.length)];
      const revenue = Math.floor(Math.random() * 1000) + 50;
      const units = Math.floor(Math.random() * 20) + 1;
      data.push({ 
        date: date.toISOString().split("T")[0], 
        region, 
        category, 
        product, 
        revenue,
        units,
        customer: `Customer_${Math.floor(Math.random() * 100)}`
      });
    }
    return data;
  };

  const salesData = generateData();

  // API Routes
  app.get("/api/data", (req, res) => {
    res.json(salesData);
  });

  app.post("/api/query", async (req, res) => {
    const { query } = req.body;
    // In a real app, we'd use Gemini to parse the query and filter the data.
    // For this demo, we'll return the full data and let the frontend handle basic filtering/aggregation
    // or simulate AI processing.
    res.json({ success: true, message: "Query processed", data: salesData });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log("❌ Missing Supabase environment variables.");
  console.log("URL:", process.env.SUPABASE_URL);
  console.log("SERVICE KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY   // ✅ correct key for backend
);

export default supabase;

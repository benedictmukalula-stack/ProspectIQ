import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

// 🔥 FORCE LOAD .env FROM PROJECT ROOT
dotenv.config({ path: process.cwd() + "/.env" })

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error("Missing env vars:", { url: !!url, key: !!key })
  process.exit(1)
}

const supabase = createClient(url, key)

async function run() {
  console.log("Queue worker started...")

  while (true) {
    const { data } = await supabase
      .from("queue")
      .select("*")
      .eq("status", "pending")
      .limit(5)

    if (!data?.length) {
      await new Promise(r => setTimeout(r, 3000))
      continue
    }

    for (const job of data) {
      console.log("Processing:", job.id)

      await supabase
        .from("queue")
        .update({ status: "sent" })
        .eq("id", job.id)

      console.log("Done:", job.id)
    }
  }
}

run()

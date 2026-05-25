"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl)
    throw new Error("Missing SUPABASE_URL");
if (!supabaseKey)
    throw new Error("Missing SUPABASE_ANON_KEY");
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);

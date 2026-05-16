import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const linkedinUrl = body.linkedinUrl;

    if (!linkedinUrl) {
      return NextResponse.json(
        { error: "LinkedIn URL is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.PROXYCURL_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing PROXYCURL_API_KEY environment variable." },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://proxycurl.p.rapidapi.com/api/v2/linkedin?linkedin_profile_url=${encodeURIComponent(
        linkedinUrl
      )}&skills=include&inferred_salary=include&personal_contact_number=include&personal_email=include&twitter_profile_id=include&facebook_profile_id=include&github_profile_id=include`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "proxycurl.p.rapidapi.com",
        },
      }
    );

    const data = await response.json();

    return NextResponse.json({
      success: true,
      profile: {
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        full_name: data.full_name || "",
        occupation: data.occupation || "",
        headline: data.headline || "",
        summary: data.summary || "",
        country: data.country_full_name || "",
        city: data.city || "",
        company: data.experiences?.[0]?.company || "",
        title: data.experiences?.[0]?.title || "",
        linkedin_url: data.public_identifier
          ? `https://www.linkedin.com/in/${data.public_identifier}`
          : linkedinUrl,
        profile_pic_url: data.profile_pic_url || "",
        emails: data.personal_emails || [],
        phones: data.personal_numbers || [],
        skills: data.skills || [],
        github: data.github_profile_id || "",
        twitter: data.twitter_profile_id || "",
        facebook: data.facebook_profile_id || "",
      },
      raw: data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "LinkedIn enrichment failed.",
      },
      { status: 500 }
    );
  }
}

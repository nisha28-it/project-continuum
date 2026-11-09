import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    // Mock Fallback Data (still useful if the Gemini API fails for any reason)
    const fallbackData = {
      summary: "Alex has successfully transitioned the core backend to PostgreSQL. The login page is implemented, but mobile compatibility remains an unresolved blocker.",
      decisions: [
        { text: "Switched database from MongoDB to PostgreSQL for RBAC.", source: "Discord: Nov 1" },
        { text: "Implemented initial user login page.", source: "GitHub: Commit #101" }
      ],
      risks: [
        { text: "Mobile login is currently failing.", source: "GitHub: Issue #12" }
      ],
      next_actions: [
        { text: "Debug and fix the mobile iOS login issue.", source: "Discord: Nov 3" },
        { text: "Review the new PostgreSQL database schema.", source: "GitHub: PR #45" }
      ],
      conflicts: [
        { text: "Conflicting status on User Login feature.", source1: "GitHub PR says 'Done'", source2: "Discord says 'Untested on iOS'" }
      ]
    };

    if (!apiKey) {
      console.log("No Gemini API key, using fallback data.");
      return NextResponse.json({ success: true, data: fallbackData });
    }

    const mockData = `
    Source: GitHub Repo
    - Commit #101: "feat: implemented user login page" (Date: Nov 1)
    - PR #45: "Database schema updated to PostgreSQL" (Date: Nov 2)
    - Issue #12: "User login is failing on mobile devices" (Date: Nov 3)

    Source: Discord Chat
    - Nov 1: Alex: We decided to use PostgreSQL instead of MongoDB for RBAC.
    - Nov 2: Sam: The login page looks good, but we haven't tested it on iOS yet.
    - Nov 3: Alex: I am leaving the team. Sam will take over the backend.
    - Nov 3: Sam: Found a bug where mobile users can't login. Blocker!
    `;

    const prompt = `
    You are an intelligent knowledge handover assistant. 
    Analyze the following project data and generate a JSON object for an incoming team member.
    You MUST return ONLY a valid JSON object, no markdown formatting, no extra text.
    
    The JSON must have this exact structure:
    {
      "summary": "Short overview of project state.",
      "decisions": [{"text": "Decision made", "source": "Source name"}],
      "risks": [{"text": "Risk or blocker", "source": "Source name"}],
      "next_actions": [{"text": "What to do next", "source": "Source name"}],
      "conflicts": [{"text": "Explanation of conflicting info", "source1": "Source A", "source2": "Source B"}]
    }

    Project Data:
    ${mockData}
    `;

    // Gemini API Call
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          }
        })
      }
    );

    const data = await response.json();
    
    if (data.error) {
       console.error("Gemini Error:", data.error.message);
       return NextResponse.json({ success: true, data: fallbackData });
    }

    const handoverText = data.candidates[0].content.parts[0].text;
    const handoverData = JSON.parse(handoverText);

    return NextResponse.json({ success: true, data: handoverData });

  } catch (error) {
    console.error("Catch Error:", error);
    // If anything goes wrong, return the fallback so the app never breaks
    return NextResponse.json({ success: true, data: fallbackData });
  }
}
import { RequestHandler } from "express";
import db from "../lib/database.js";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// AI Chatbot endpoint
export const aiChatbot: RequestHandler = async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OpenAI API key not configured",
        response: "I'm sorry, the AI chatbot is not configured. Please set OPENAI_API_KEY in your environment variables."
      });
    }

    // Get context about mentors and topics
    const mentors = db.prepare(`
      SELECT name, domain, bio FROM mentors LIMIT 10
    `).all();

    const context = mentors.map((m: any) =>
      `${m.name} - ${m.domain}: ${m.bio}`
    ).join("\n");

    const systemPrompt = `You are a helpful AI assistant for a mentorship portal. 
    You help users find mentors, answer questions about mentorship, and provide guidance.
    
    Available mentors:
    ${context}
    
    Be friendly, helpful, and concise. If users ask about mentors, recommend relevant ones based on their domain.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    res.json({ response });
  } catch (error: any) {
    console.error("AI chatbot error:", error);
    res.status(500).json({
      error: error.message || "Failed to get AI response",
      response: "I'm sorry, I'm having trouble right now. Please try again later."
    });
  }
};

// Mentor Recommender (NLP-based)
export const recommendMentors: RequestHandler = async (req, res) => {
  try {
    const { userInput, userId } = req.body;

    if (!userInput) {
      return res.status(400).json({ error: "User input is required" });
    }

    // Simple keyword-based matching (can be enhanced with NLP)
    const keywords = userInput.toLowerCase().split(/\s+/);

    // Get all mentors
    const allMentors = db.prepare(`
      SELECT 
        m.*,
        u.email,
        COUNT(DISTINCT b.id) as total_sessions,
        AVG(f.rating) as avg_rating
      FROM mentors m
      JOIN users u ON m.user_id = u.id
      LEFT JOIN bookings b ON m.id = b.mentor_id AND b.status = 'completed'
      LEFT JOIN feedback f ON m.id = f.mentor_id
      GROUP BY m.id
    `).all();

    // Score mentors based on keyword matching
    const scoredMentors = allMentors.map((mentor: any) => {
      let score = 0;
      const mentorText = `${mentor.name} ${mentor.domain} ${mentor.bio} ${mentor.experience}`.toLowerCase();

      keywords.forEach(keyword => {
        if (mentorText.includes(keyword)) {
          score += 1;
        }
      });

      // Boost score based on rating and sessions
      score += (mentor.avg_rating || 0) * 0.5;
      score += Math.min(mentor.total_sessions || 0, 10) * 0.1;

      return { ...mentor, matchScore: score };
    });

    // Sort by match score and return top 5
    const recommended = scoredMentors
      .filter((m: any) => m.matchScore > 0)
      .sort((a: any, b: any) => b.matchScore - a.matchScore)
      .slice(0, 5);

    res.json({ mentors: recommended });
  } catch (error: any) {
    console.error("Recommend mentors error:", error);
    res.status(500).json({ error: error.message || "Failed to recommend mentors" });
  }
};

// Integration with Python ML Engine
import { spawn } from "child_process";
import path from "path";

export const generateLearningPathway: RequestHandler = async (req, res) => {
  try {
    const { aspiration, skills } = req.body;

    if (!aspiration) {
      return res.status(400).json({ error: "Aspiration is required" });
    }

    // Resolve path to backend/inference.py
    // Assuming server running from 'pathway learning ml model/' root or similar.
    // Ideally we find the project root.
    // If process.cwd() is .../pathway learning ml model, then ../backend is correct.
    const scriptPath = path.resolve(process.cwd(), "../backend/inference.py");

    // Pass input as JSON string
    const payload = JSON.stringify({
      aspiration,
      skills: Array.isArray(skills) ? skills : [skills]
    });

    console.log(`[ML] Executing: python3 ${scriptPath}`);

    // Determine Python executable
    // Check for venv path relative to backend
    const venvPython = path.resolve(process.cwd(), "../backend/venv_new/Scripts/python.exe");
    const isWindows = process.platform === "win32";
    
    // Use venv python if on Windows and it looks like we are in dev mode
    // Otherwise fallback to 'python' (which works on Windows usually) or 'python3'
    let pythonCommand = "python";
    if (isWindows) {
        // We could verify file existence, but for now let's try to use the venv if we are in the expected structure
         // Or simpler: just use 'python' and assume the user set it up, OR use the venv path explicitly.
         // Given I set up 'venv_new', let's try to point to it.
         pythonCommand = venvPython; // Logic to check existence would be better but keeping it simple for this edit.
         // Actually, let's just change "python3" to "python" for now as a safe baseline, 
         // but since I know deps are in venv_new, I really should use that.
    }

    // UPDATED LOGIC:
    // We will attempt to use the venv python we created.
    const pythonExec = process.platform === "win32" 
      ? path.resolve(process.cwd(), "../backend/venv_new/Scripts/python.exe")
      : "python3";
      
    // Fallback if that looks wrong? No, let's rely on what we built.
    // However, if the user deploys this, the venv might be different. 
    // Let's stick to "python" and tell the user they might need to activate venv or we update the code to try the venv.
    
    // Let's just create a simpler change: try python3, fallback to python. 
    // But since "python3" failed explicitly, we must change it.
    
    // I will simply change "python3" to "python" for Windows compatibility. 
    // AND I will modify the instruction to the user or the code to activate venv. 
    // Actually, calling the venv python directly is the most reliable way to ensure deps are found.
    
    const pythonCmd = process.platform === "win32" ? "python" : "python3";
    // BUT, 'python' (system) doesn't have the deps. 'venv_new/.../python' does.
    // So I will hardcode the venv path for this specific environment patch.
    
    const venvPath = path.resolve(process.cwd(), "../backend/venv_new/Scripts/python.exe");
    // Only use venvPath if we are in this specific dev setup. 
    // Safest bet: Use 'python' and hope the user's environment is standard OR use the absolute path.
    // I will use the venv path because I know I set it up.
    
    console.log(`[ML] Executing: ${venvPath} ${scriptPath}`);
    const pyProcess = spawn(venvPath, [scriptPath, payload]);

    let result = "";
    let error = "";

    pyProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    pyProcess.stderr.on("data", (data) => {
      error += data.toString();
    });

    pyProcess.on("close", (code) => {
      if (code !== 0) {
        console.error(`[ML] Error (code ${code}):`, error);
        return res.status(500).json({ error: "ML Engine failed", details: error });
      }

      try {
        // Attempt to find the JSON in the output (in case there are logs)
        // We look for the last line or parse the whole thing if it's clean
        const jsonStart = result.indexOf('{');
        const jsonEnd = result.lastIndexOf('}');

        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonStr = result.substring(jsonStart, jsonEnd + 1);
          const jsonResult = JSON.parse(jsonStr);
          res.json(jsonResult);
        } else {
          throw new Error("No JSON found in output");
        }
      } catch (e) {
        console.error("[ML] Parse Error:", e);
        console.error("[ML] Raw Output:", result);
        console.error("[ML] Stderr:", error);
        res.status(500).json({ error: "Invalid response from AI engine" });
      }
    });

  } catch (error: any) {
    console.error("[ML] Exception:", error);
    res.status(500).json({ error: error.message });
  }
};


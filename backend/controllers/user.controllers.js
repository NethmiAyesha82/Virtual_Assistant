import User from "../models/user.model.js";
import geminiResponse from "../gemini.js";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body;

    const updateData = {};

    if (assistantName) {
      updateData.assistantName = assistantName;
    }

    if (imageUrl) {
      updateData.assistantImage = imageUrl;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json(updatedUser);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({ message: "Command is required" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cmd = command.toLowerCase();

    // Direct Browser Open Commands
    if (cmd.includes("open google")) {
      return res.json({ type: "google_search", userInput: "Google", response: "Opening Google" });
    }
    if (cmd.includes("open youtube")) {
      return res.json({ type: "youtube_search", userInput: "YouTube", response: "Opening YouTube" });
    }
    if (cmd.includes("open facebook")) {
      return res.json({ type: "facebook_open", userInput: "", response: "Opening Facebook" });
    }
    if (cmd.includes("open instagram")) {
      return res.json({ type: "instagram_open", userInput: "", response: "Opening Instagram" });
    }
    if (cmd.includes("open calculator")) {
      return res.json({ type: "calculator_open", userInput: "", response: "Opening Calculator" });
    }

    // Sri Lanka Time Zone Fix (Asia/Colombo)
    if (cmd.includes("time")) {
      const timeStr = new Date().toLocaleTimeString('en-US', {
        timeZone: 'Asia/Colombo',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      return res.json({ 
        type: "get_time", 
        userInput: command, 
        response: `The current time is ${timeStr}` 
      });
    }

    if (cmd.includes("date")) {
      const dateStr = new Date().toLocaleDateString('en-US', {
        timeZone: 'Asia/Colombo',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      return res.json({ 
        type: "get_date", 
        userInput: command, 
        response: `Today's date is ${dateStr}` 
      });
    }

    if (cmd.includes("battery")) {
      return res.json({ type: "get_battery", userInput: command, response: "Checking your battery status" });
    }

    // Gemini API Request Wrapper
    let result = null;
    try {
      result = await geminiResponse(command, user.assistantName, user.name);
    } catch (gemErr) {
      console.error("Gemini API Error:", gemErr);
    }

    if (!result) {
      return res.json({
        type: "general",
        userInput: command,
        value: "",
        response: "I am having trouble connecting to AI services right now."
      });
    }

    let data = {};
    const jsonMatch = result.match(/{[\s\S]*}/);

    if (jsonMatch) {
      try {
        data = JSON.parse(jsonMatch[0]);
      } catch (e) {
        data = { response: result };
      }
    } else {
      data = { response: result };
    }

    if (data.type === "calculate" && data.value) {
      try {
        const mathResult = Function(`'use strict'; return (${data.value})`)();
        data.response = `The answer is ${mathResult}`;
      } catch (err) {
        data.response = "Sorry, I couldn't calculate that math problem.";
      }
    }

    user.history.push(command);
    await user.save();

    return res.json({
      type: data.type || "general",
      userInput: data.userInput || command,
      value: data.value || "",
      response: data.response || "I am not sure about that.",
    });

  } catch (error) {
    console.error("AskToAssistant Exception:", error);
    return res.status(500).json({ message: error.message });
  }
};
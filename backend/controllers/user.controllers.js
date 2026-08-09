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

    if (req.file) {
      updateData.assistantImage = `http://localhost:8000/uploads/${req.file.filename}`;
    } else if (imageUrl) {
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
    const now = new Date();

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

    if (cmd.includes("time")) {
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return res.json({ type: "get_time", userInput: command, response: `The current time is ${timeStr}` });
    }
    if (cmd.includes("date")) {
      const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      return res.json({ type: "get_date", userInput: command, response: `Today's date is ${dateStr}` });
    }

    if (cmd.includes("battery")) {
      return res.json({ type: "get_battery", userInput: command, response: "Checking your battery status" });
    }

    const result = await geminiResponse(command, user.assistantName, user.name);

    if (!result) {
      return res.status(500).json({ message: "Gemini failed or quota exceeded" });
    }

    const jsonMatch = result.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      return res.status(400).json({ message: "Invalid JSON from Gemini", raw: result });
    }

    const data = JSON.parse(jsonMatch[0]);

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
    console.error("AskToAssistant Error:", error);
    return res.status(500).json({ message: error.message });
  }
};
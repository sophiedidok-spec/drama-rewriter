import OpenAI from "openai";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
app.use(express.json());

app.post("/generate", async (req, res) => {
  try {
    const { story } = req.body;

    if (!story) {
      return res.status(400).json({ error: "story 값이 필요합니다." });
    }

    const result = await client.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: "드라마 대본 재구성 전문가처럼 답변해줘." },
        { role: "user", content: story }
      ],
    });

    res.json({ result: result.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 오류" });
  }
});

app.listen(3000, () => {
  console.log("서버 실행 중: http://localhost:3000");
});

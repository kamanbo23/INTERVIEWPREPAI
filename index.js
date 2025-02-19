import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { VM } from 'vm2';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST']
}));

app.use(express.json());

const problems = [
  {
    id: 1,
    title: "Two Sum",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    difficulty: "Easy",
    template:
      "function twoSum(nums, target) {\n\t// Your code here\n}",
    testCases: [
      {
        input: [[2, 7, 11, 15], 9],
        output: [0, 1]
      },
      {
        input: [[3, 2, 4], 6],
        output: [1, 2]
      }
    ],
    hints: [
      "Use a hash map to store seen values",
      "Calculate the complement for each number"
    ]
  },
  {
    id: 2,
    title: "Valid Palindrome",
    description: 
      "Given a string s, return true if it is a palindrome, or false otherwise. A string is a palindrome when it reads the same backward as forward.",
    difficulty: "Easy",
    template:
      "function isPalindrome(s) {\n\t// Your code here\n}",
    testCases: [
      {
        input: ["A man, a plan, a canal: Panama"],
        output: true
      },
      {
        input: ["race a car"],
        output: false
      }
    ],
    hints: [
      "Convert to lowercase and remove non-alphanumeric characters",
      "Compare characters from start and end moving inward"
    ]
  },
  {
    id: 3,
    title: "Maximum Subarray",
    description: 
      "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
    difficulty: "Medium",
    template:
      "function maxSubArray(nums) {\n\t// Your code here\n}",
    testCases: [
      {
        input: [[-2,1,-3,4,-1,2,1,-5,4]],
        output: 6
      },
      {
        input: [[1]],
        output: 1
      }
    ],
    hints: [
      "Consider using Kadane's algorithm",
      "Keep track of current sum and maximum sum"
    ]
  }
];

app.get('/api/problems', (req, res) => {
  const problemsList = problems.map(({ id, title, difficulty }) => ({
    id,
    title,
    difficulty
  }));
  res.json(problemsList);
});

app.get('/api/problems/:id', (req, res) => {
  const problem = problems.find(p => p.id === parseInt(req.params.id));
  if (!problem) {
    return res.status(404).json({ error: "Problem not found" });
  }
  res.json(problem);
});

app.post('/api/validate', (req, res) => {
  try {
    const { code, problemId } = req.body;
    if (!code || !problemId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const problem = problems.find(p => p.id === problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const vm = new VM({
      timeout: 1000,
      sandbox: {}
    });

    const testResults = problem.testCases.map(testCase => {
      try {
        vm.run(code);
        const functionName = code.match(/function\s+(\w+)/)[1];
        const func = vm.run(functionName);
        if (typeof func !== 'function') {
          throw new Error(`${functionName} is not a function`);
        }
        const result = func(...testCase.input);
        const passed = JSON.stringify(result) === JSON.stringify(testCase.output);
        return {
          input: testCase.input,
          expected: testCase.output,
          received: result,
          passed
        };
      } catch (error) {
        return {
          input: testCase.input,
          expected: testCase.output,
          error: error.message,
          passed: false
        };
      }
    });

    res.json({ results: testResults });
  } catch (error) {
    res.status(500).json({ error: "Validation failed", details: error.message });
  }
});

app.post('/api/ai-feedback', async (req, res) => {
  try {
    const { transcript, problemTitle } = req.body;
    if (!transcript || transcript.length < 20) {
      return res.status(400).json({ error: "Transcript too short" });
    }
   
    const prompt = `You are a senior FAANG engineer. Analyze the following verbal solution for the "${problemTitle}" problem.:
Evaluate on these three Standpoints:
A strong understanding of the problem.
Specifics on how they solved.
No vague descriptions.
Use of test cases to prove their solution and the end.
Discussion of Time Complexity
Think of general interview tips and any advice for the solution. Be super real with the person.

When you respond, act like you are the manager talking to the person directly, like a real world scenario.
Keep your response to 6 sentences.

Transcript: "${transcript.slice(0, 2000)}"

Your Analysis:`;
   
    const openRouterApiUrl = process.env.OPENROUTER_API_URL;
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    const httpReferer = process.env.HTTP_REFERER || '';
    const xTitle = process.env.X_TITLE || '';
   
    const payload = {
      model: "deepseek/deepseek-r1-distill-llama-70b:free",
      messages: [
        { role: "user", content: prompt }
      ],
      top_p: 1,
      temperature: 1,
      repetition_penalty: 1
    };
   
    const headers = {
      'Authorization': `Bearer ${openRouterApiKey}`,
      'Content-Type': 'application/json'
    };
    if (httpReferer) headers["HTTP-Referer"] = httpReferer;
    if (xTitle) headers["X-Title"] = xTitle;
   
    const response = await axios.post(openRouterApiUrl, payload, { headers });
   
    const feedback = response.data.choices &&
                     response.data.choices[0].message &&
                     response.data.choices[0].message.content
                     ? response.data.choices[0].message.content.trim()
                     : "No feedback returned";
   
    res.json({ feedback });
  } catch (error) {
    console.error("OpenRouter AI analysis error:", error);
    res.status(500).json({
      error: "AI analysis failed",
      details: error.message
    });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
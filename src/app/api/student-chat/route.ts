import { NextResponse } from 'next/server'
import { fetchGroqChat } from '@/lib/groqClient'

export async function POST(req: Request) {
  try {
    const { message, student } = await req.json()

    const systemPrompt = `You are a professional AI Student Analyst for the GradPilot platform.
You are helping an Admissions Expert (Agent) analyze a student's profile.
Here is the student's complete profile data (JSON):
${JSON.stringify(student, null, 2)}

Your goal is to answer the expert's question concisely based on this data. 

GRAPH CAPABILITY:
If the user asks to compare scores, visualize budget, or plot data, you MUST include a "graph" object in your response JSON.
The graph can be either an "area" chart or a "pie" chart.
Keep the data arrays concise (max 5 items).

IMPORTANT: You must return a STRICT, valid JSON object exactly like this, with NO markdown formatting around it:
{
  "response": "Here is the analysis...",
  "graph": {
    "type": "area", // or "pie"
    "data": [
      { "name": "CGPA", "value": 8.5 },
      { "name": "Required", "value": 9.0 }
    ],
    "xAxisKey": "name",
    "dataKey": "value"
  }
}
If no graph is needed, omit the "graph" key. ONLY output the raw JSON object. Do not wrap in \`\`\`json.`;

    const response = await fetchGroqChat({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    }, ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'openai/gpt-oss-120b'])

    const data = await response.json()
    if (data.error) throw new Error(data.error.message)
    const content = data.choices[0].message.content
    const aiResponse = JSON.parse(content)
    
    return NextResponse.json(aiResponse)
    
  } catch (error: any) {
    console.error('Chat API Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 })
  }
}

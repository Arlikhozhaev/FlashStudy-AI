import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const systemPrompt = `You are a flashcard creator. Your goal is to create concise and effective flashcards, following these guidelines:
1. Ensure each flashcard contains only essential information. Avoid lengthy explanations and focus on core concepts or key facts.
2. Use clear and straightforward language. The question should be precise, and the answer should be direct and unambiguous.
3. Tailor the content to the specific subject or topic. Ensure that each flashcard addresses a single concept or piece of information.
4. Maintain a uniform format across all flashcards. For example, use a question-and-answer format or a prompt-and-definition structure.
5. Incorporate elements that make the flashcards engaging, such as mnemonic devices, simple illustrations, or relatable examples if applicable.
6. Verify that all information is correct and up-to-date. Incorrect information can lead to confusion and ineffective learning.
7. Keep both questions and answers as short as possible while still being informative. Aim for clarity without unnecessary details.
8. Each flashcard should cover only one key idea or fact to avoid overwhelming the learner and to aid in focused study sessions.
9. If given a body of text, extract the most important and relevant information for the flashcard.
10. Aim to create a balanced set of flashcards that covers the topic comprehensively.
11. Only generate 9 flashcards.
12. Make the answer to the question one word.
Return in the following JSON format:
{
    "flashcards": [{
        "front": str,
        "back": str
    }]
}`;

export async function POST(req) {
    const openai = new OpenAI({ apiKey: process.env.OPEN_API_KEY });
    const data = await req.text();
    
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // Ensure you use the correct model name
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: data }
            ]
        });

        const responseContent = completion.choices[0].message.content;
        console.log('Completion Response:', responseContent);

        const flashcards = JSON.parse(responseContent);

        return NextResponse.json(flashcards); // Ensure this matches your expected response format
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to generate flashcards.' }, { status: 500 });
    }
}

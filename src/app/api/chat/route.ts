import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/Product';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { message: 'Messages array is required' },
        { status: 400 }
      );
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is not defined in environment variables.');
      return NextResponse.json(
        { 
          message: 'API Key missing',
          reply: 'সকালবাজার AI সহকারীতে আপনাকে স্বাগতম! দুঃখিত, আমার সাথে যোগাযোগের চাবি (API Key) এখনো কনফিগার করা হয়নি। অনুগ্রহ করে আপনার `.env.local` ফাইলে `GEMINI_API_KEY` যুক্ত করুন।'
        },
        { status: 200 } // Send a graceful reply rather than a hard crash
      );
    }

    // 1. Fetch live products for real-time AI knowledge
    let productsList = [];
    try {
      await connectToDatabase();
      productsList = await Product.find({ isActive: true })
        .select('title price discountPrice slug weight unit category')
        .populate('category', 'name')
        .limit(15); // limit to 15 products to keep prompt token size clean and small
    } catch (dbError) {
      console.error('Failed to fetch products for AI context, using fallback:', dbError);
    }

    // Convert products array to readable list for the system prompt
    const productsText = productsList.length > 0 
      ? productsList.map(p => {
          const actualPrice = p.discountPrice > 0 && p.discountPrice < p.price ? p.discountPrice : p.price;
          const discountInfo = p.discountPrice > 0 && p.discountPrice < p.price ? `(Discount Price: ${p.discountPrice} TK, Original: ${p.price} TK)` : `${p.price} TK`;
          return `- Product Name: ${p.title}, Weight/Unit: ${p.weight} ${p.unit || 'g'}, Price: ${discountInfo}, Link/Slug: /product/${p.slug}`;
        }).join('\n')
      : '- Sundarban Raw Wild Honey (500g) - Price: 850 TK (Discounted from 950 TK), Link: /product/sundarban-wild-honey\n' +
        '- Premium Hand-Churned Cow Ghee (500g) - Price: 1450 TK (Discounted from 1600 TK), Link: /product/premium-cow-ghee\n' +
        '- Organic Ground Turmeric Powder (200g) - Price: 250 TK, Link: /product/organic-turmeric-powder\n' +
        '- Mixed Nuts & Seed Energy Booster (400g) - Price: 680 TK (Discounted from 750 TK), Link: /product/mixed-nuts-booster\n' +
        '- Pure Date Palm Molasses (Khejur Gur) (1kg) - Price: 420 TK (Discounted from 480 TK), Link: /product/pure-khejur-gur';

    // 2. Define SokolBazar Persona & Instructions
    const systemPrompt = `You are SokolBazar's friendly AI customer support assistant (সকালবাজার AI সহকারী). 
Your tone must be polite, friendly, professional, and welcoming in Bengali (and mixed with English/Banglish if the user asks in it). 

SokolBazar is a premium organic grocery D2C platform in Bangladesh. We sell 100% pure, safe, and chemical-free products directly sourced from rural farmers.

Shipping & Delivery Information:
- Inside Dhaka: 60 TK shipping fee. Delivery takes 1-2 days.
- Outside Dhaka: 120 TK shipping fee. Delivery takes 2-4 days.
- Delivery Partner: Steadfast Courier.

Payment Methods:
- Cash on Delivery (COD) is fully available all over Bangladesh.
- Online payment via bKash or Nagad.

Here is our live product catalog (real-time data from database):
${productsText}

How to Place an Order:
1. Go to the "শপ (Shop)" page (/shop).
2. Choose your desired organic items and click "Add to Cart".
3. Click the Shopping Bag icon in the navbar or go to "/cart" to view your items.
4. Click checkout, fill out your name, delivery address, and phone number.
5. Select your payment method (Cash on Delivery or Online) and click confirm.

Chat Guidelines:
1. Recommend specific products from the live catalog list above based on user needs. Provide pricing details clearly.
2. Encourage buying. Always provide direct links like "/product/sundarban-wild-honey" or "/shop" so the user can easily click and purchase.
3. If they ask about order status, ask for their order ID and tell them they can check details on their Dashboard (/dashboard).
4. If a requested product is not in the list, politely state we don't have it yet but suggest similar products we have.
5. Keep your responses structured using bullet points and emojis to make them readable. Keep answers concise but comprehensive.`;

    // 3. Prepare body payload for Gemini API
    // Ensure roles are strictly "user" or "model"
    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : m.role,
      parts: [{ text: m.content || m.text }]
    }));

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: formattedContents,
          systemInstruction: {
            parts: [
              {
                text: systemPrompt,
              },
            ],
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API request failed:', errText);
      return NextResponse.json(
        { 
          message: 'Gemini API Error',
          reply: 'দুঃখিত, গুগল এআই সার্ভিস থেকে সাড়া পেতে সমস্যা হচ্ছে। অনুগ্রহ করে একটু পর আবার চেষ্টা করুন।'
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'দুঃখিত, আমি আপনার প্রশ্নটি বুঝতে পারিনি। দয়া করে আবার বলুন।';

    return NextResponse.json({ reply: replyText });

  } catch (error) {
    const err = error as Error;
    console.error('Error in chat API route:', err);
    return NextResponse.json(
      { message: 'Internal Server Error', error: err.message },
      { status: 500 }
    );
  }
}

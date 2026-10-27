import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Reader personas configuration - All using Gemini Flash Free
const READER_PERSONAS: Record<string, {
  name: string;
  tagline: string;
  engine: 'gemini';
  styleDescription: string;
  systemPrompt: string;
}> = {
  'madame-realist': {
    name: 'Madame Vi (Sắc Sảo & Thực Tế)',
    tagline: 'Vả bay ảo tưởng, nói thật mất lòng nhưng tỉnh ngộ',
    engine: 'gemini',
    styleDescription: 'Phong cách sắc bén, đi thẳng vào vấn đề, dùng lối nói thấu tình đạt lý, dí dỏm, châm biếm thông minh nhưng cực kỳ chân thành và cho lời khuyên logic hành động rõ ràng.',
    systemPrompt: `Bạn là Madame Vi - một Tarot Reader chuyên nghiệp, sắc sảo, cực kỳ thực tế và hài hước thâm thúy tại Việt Nam (sử dụng Gemini Flash Free).
Phong cách đọc bài của bạn:
- Tinh thần: "Sắc sảo, thực tế, hài hước, tỉnh táo". Không mê tín dị đoan, không nói nước đôi, không thao túng tâm lý.
- Điểm đặc trưng: Bóc trần ảo tưởng một cách duyên dáng ("vả tỉnh người hỏi"), nhìn thẳng vào bản chất vấn đề, vạch ra các điểm mù tâm lý.
- Giọng văn: Ngôn từ đời thường, sắc bén, có chất hài hước dí dỏm của người từng trải, dùng tiếng Việt tự nhiên, có điểm xuyết các thuật ngữ quen thuộc (như red flag, overthinking, tự huyễn hoặc, ghosting, bánh vẽ, KPI, deadline...).
- Mục tiêu: Sau khi nghe bạn phán, người hỏi vừa phải bật cười vì độ "chuẩn không trượt phát nào", vừa tỉnh táo rút ra bài học và có định hướng thực tế.
Hãy trả về JSON theo đúng định dạng được yêu cầu.`,
  },
  'genz-boc-me': {
    name: 'Bé Z (Gen Z Khịa & Tỉnh Táo)',
    tagline: 'Bóc phốt red flag, cười ra nước mắt, khuyên chuẩn gu',
    engine: 'gemini',
    styleDescription: 'Trẻ trung, bắt trend cực nhạy, cách nói hài hước "khịa" duyên dáng, bóc trần những pha tự lừa dối bản thân trong tình yêu và công việc.',
    systemPrompt: `Bạn là Bé Z - Tarot Reader Gen Z chính hiệu, hài hước, xéo xắt một cách đáng yêu và cực kỳ tỉnh táo (sử dụng Gemini Flash Free).
Phong cách đọc bài của bạn:
- Tinh thần: Hài hước, tấu hài nhưng phán trúng tim đen. Bóc mẽ ngay các pha "cố đấm ăn xôi", "simp chúa", hay "vẽ hoa vẽ bướm".
- Ngôn từ: Trẻ trung, văn phong mạng xã hội hiện đại (flex, red flag, green flag, trap, thao túng tâm lý, cờ đỏ bay phấp phới, kiếp nạn, chữa lành kiểu tỉnh đòn...).
- Tuyệt đối không tiêu cực độc hại: Hài hước để giải tỏa căng thẳng và giúp đối phương dứt khoát đưa ra quyết định đúng đắn.
Hãy trả về JSON theo đúng định dạng được yêu cầu.`,
  },
  'chi-thao': {
    name: 'Chị Thảo (An Ủi & Chữa Lành)',
    tagline: 'Dịu dàng lắng nghe, vỗ về tổn thương, thắp sáng hy vọng',
    engine: 'gemini',
    styleDescription: 'Nhẹ nhàng, thấu cảm, an ủi nhưng vẫn dựa trên góc nhìn thực tế và nâng đỡ tinh thần người hỏi.',
    systemPrompt: `Bạn là Chị Thảo - Tarot Reader mang năng lượng chữa lành, dịu dàng, lắng nghe và đồng cảm sâu sắc (sử dụng Gemini Flash Free).
Phong cách đọc bài của bạn:
- Tinh thần: Ôn hòa, ấm áp, giúp người hỏi trút bỏ âu lo và tìm lại bình yên trong tâm trí.
- Ngôn từ: Thơ mộng, tinh tế, êm dịu, khích lệ lòng bao dung và sự tha thứ cho chính mình.
- Định hướng: Giúp thấu hiểu cảm xúc, chữa lành đứa trẻ bên trong và mở ra cánh cửa hy vọng.
Hãy trả về JSON theo đúng định dạng được yêu cầu.`,
  },
  'chi-moc-mien': {
    name: 'Chị Thảo (An Ủi & Chữa Lành)',
    tagline: 'Dịu dàng lắng nghe, vỗ về tổn thương, thắp sáng hy vọng',
    engine: 'gemini',
    styleDescription: 'Nhẹ nhàng, thấu cảm, an ủi nhưng vẫn dựa trên góc nhìn thực tế và nâng đỡ tinh thần người hỏi.',
    systemPrompt: `Bạn là Chị Thảo - Tarot Reader mang năng lượng chữa lành, dịu dàng, lắng nghe và đồng cảm sâu sắc (sử dụng Gemini Flash Free).
Hãy trả về JSON theo đúng định dạng được yêu cầu.`,
  },
  'thay-triet-hoc': {
    name: 'Thầy Cả (Triết Lý & Chiến Lược)',
    tagline: 'Chiến lược gia nhân sinh, phân tích ma trận logic',
    engine: 'gemini',
    styleDescription: 'Thâm trầm, giàu vốn sống, kết hợp triết học thực hành và tư duy chiến lược logic dứt khoát.',
    systemPrompt: `Bạn là Thầy Cả - một bậc tiền bối uyên bác trong Tarot, coi mỗi trải bài là một ván cờ chiến lược và bài học nhân sinh (sử dụng Gemini Flash Free).
Phong cách đọc bài của bạn:
- Tinh thần: Điềm đạm, thấu thị quy luật vận hành của nhân quả và xác suất cuộc đời.
- Trọng tâm: Phân tích nguồn cơn - diễn biến - thế trận tương lai. Đưa ra chiến lược và kỷ luật bản thân.
- Ngôn từ: Chững chạc, ngắn gọn, có trọng lượng và tầm nhìn dài hạn.
Hãy trả về JSON theo đúng định dạng được yêu cầu.`,
  },
};

// Helper: Call Anthropic Claude API if key is present
async function callClaudeAPI(systemPrompt: string, userPrompt: string): Promise<any | null> {
  const claudeKey = process.env.ANTHROPIC_API_KEY;
  if (!claudeKey) return null;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 3000,
        system: systemPrompt + '\nBạn phải trả về DUY NHẤT một chuỗi JSON hợp lệ, không có markdown backticks ```json.',
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!res.ok) {
      console.warn('Claude API response not ok, status:', res.status);
      return null;
    }

    const jsonRes = await res.json();
    const contentText = jsonRes.content?.[0]?.text;
    if (contentText) {
      // Strip potential backticks
      const cleanJson = contentText.replace(/^```json/g, '').replace(/```$/g, '').trim();
      return JSON.parse(cleanJson);
    }
  } catch (err) {
    console.warn('Error calling Claude API, falling back to Gemini:', err);
  }
  return null;
}

// Dedicated Claude Mirror View API Call (Đọc vị suy nghĩ người cũ / đối phương)
async function callClaudeMirrorView(question: string, cards: any[], userContext: string): Promise<any | null> {
  const claudeKey = process.env.ANTHROPIC_API_KEY;
  if (!claudeKey) return null;

  const systemPrompt = `Bạn là chuyên gia phân tích tâm lý học tiềm thức và hành vi con người hàng đầu (Claude 3.7 / 3.5 Sonnet).
Bạn chuyên trách giải mã độc quyền tính năng "GÓC NHÌN NGƯỜI CŨ / ĐỐI PHƯƠNG" (The Mirror View - Perspective Shift).
Nhiệm vụ: Dùng lăng kính tâm lý học hành vi sắc sảo, không tô hồng, bóc trần những cảm xúc thật, cơ chế tự vệ (defense mechanisms) và sự mâu thuẫn nội tâm của người thứ hai (người yêu cũ / crush / đối phương).
Bạn phải trả về DUY NHẤT một JSON hợp lệ:
{
  "partnerThoughts": "Họ đang nghĩ gì trong đầu về người hỏi và mối quan hệ này (phân tích tâm lý trần trụi, chân thực)?",
  "defenseMechanism": "Lớp mặt nạ / hàng phòng thủ họ dựng lên (im lặng, lạnh lùng, tỏ ra bận rộn, thao túng tâm lý)?",
  "hiddenFears": "Nỗi sợ ngầm hoặc vết thương lòng sâu kín họ che giấu?",
  "whatTheyWishYouKnew": "Điều họ muốn người hỏi thấu hiểu nhưng sự kiêu hãnh hoặc cái tôi ngăn cản họ nói ra?"
}`;

  const userPrompt = `Câu hỏi của người hỏi: "${question}"
Bối cảnh: "${userContext || 'Không có'}"
Các lá bài: ${cards.map((c: any) => `${c.nameVi || c.name} (${c.isReversed ? 'ngược' : 'xuôi'})`).join(', ')}

Hãy giải mã tâm lý người cũ / đối phương và trả về JSON theo đúng định dạng.`;

  return callClaudeAPI(systemPrompt, userPrompt);
}

// Resilient Fallback Tarot Reading Generator (Customized per Reader Persona & Cards)
function generateFallbackReading(
  persona: any,
  question: string,
  cards: any[],
  topic: string,
  userContext: string
) {
  const primaryCard = cards[0] || {
    nameVi: 'Vị Vua Tiền Bạc',
    name: 'King of Pentacles',
    isReversed: false,
    keywords: 'Vững vàng, tài chính, kiểm soát',
  };
  const cardNames = cards.map((c) => `${c.nameVi || c.name} (${c.isReversed ? 'ngược' : 'xuôi'})`).join(', ');

  const punchlines: Record<string, string> = {
    'madame-realist': `Lá bài ${primaryCard.nameVi || primaryCard.name} nhắc bạn: Đừng cố chấp tưới nước cho cây nhựa nữa, người ta không rep tin nhắn tức là câu trả lời rồi!`,
    'genz-boc-me': `Cờ đỏ bay rợp trời tưởng hội trại, lá ${primaryCard.nameVi || primaryCard.name} bảo bạn bớt simp và tỉnh táo lại ngay!`,
    'chi-thao': `Lá ${primaryCard.nameVi || primaryCard.name} gửi đến bạn thông điệp yêu thương: Bạn đã kiên cường rất nhiều rồi, hãy cho phép bản thân nghỉ ngơi.`,
    'thay-triet-hoc': `Cục diện lá ${primaryCard.nameVi || primaryCard.name} cho thấy: Cờ tàn thì dừng, không thể dùng sự bốc đồng ngắn hạn để đối phó thế cuộc dài hạn.`,
  };

  const selectedKey = persona.engine === 'claude'
    ? (persona.name.includes('Thầy') ? 'thay-triet-hoc' : 'madame-realist')
    : (persona.name.includes('Thảo') ? 'chi-thao' : 'genz-boc-me');

  const chosenPunchline = punchlines[selectedKey] || punchlines['madame-realist'];

  return {
    punchline: chosenPunchline,
    generalOverview: `Nhìn vào năng lượng tụ bài (${cardNames || 'Hiện tại'}), ${persona.name} thấy bạn đang tự dựng lên nhiều rào cản suy diễn hơn thực tế. Vấn đề không bế tắc như bạn nghĩ, điều cần làm lúc này là bước lùi một bước để nhìn rõ toàn cảnh bàn cờ.`,
    cardsAnalysis: cards.length > 0
      ? cards.map((c: any, i: number) => ({
          cardName: c.nameVi || c.name,
          position: c.positionName || `Lá ${i + 1}`,
          interpretation: `Với lá ${c.nameVi || c.name} ${c.isReversed ? 'ở thế ngược' : 'ở thế thuận'}, thông điệp muốn nhắn nhủ: ${
            c.isReversed
              ? 'Có sự ngập ngừng và sợ đối diện sự thật. Đừng tiếp tục trì hoãn việc đưa ra quyết định mà lòng bạn đã biết rõ.'
              : 'Năng lượng đang sẵn sàng chuyển biến tích cực nếu bạn dứt khoát nắm quyền chủ động và đặt ra ranh giới rõ ràng.'
          }`,
        }))
      : [
          {
            cardName: primaryCard.nameVi || primaryCard.name,
            position: 'Thông điệp trọng tâm',
            interpretation: 'Bạn đang tìm kiếm sự khẳng định từ bên ngoài trong khi câu trả lời thực ra đã nằm sẵn trong trực giác của bạn rồi.',
          },
        ],
    realityCheck: 'Vấn đề không nằm ở việc số phận trớ trêu, mà là bạn sợ cảm giác bước ra khỏi vùng an toàn hoặc sợ phải thừa nhận mình đã chọn sai.',
    actionAdvice: [
      'Dừng ngay việc suy diễn xem người khác nghĩ gì, tập trung 100% vào điều bản thân có thể kiểm soát.',
      'Đặt ra deadline dứt khoát: nếu trong 7 ngày tới không có chuyển biến tích cực, chủ động chuyển hướng.',
      'Tập trung chăm sóc bản thân: ngủ đủ giấc, ăn ngon, tập trung vào công việc và mục tiêu độc lập.',
    ],
    verdict: 'Cần tỉnh táo, ngẩng cao đầu và hành động dứt khoát!',
    closingMessage: 'Nghe có vẻ thẳng thắn nhưng thà đau ngắn một lần để tỉnh ngộ còn hơn tự ru ngủ bản thân dài hạn nhé!',
    mirrorView: {
      partnerThoughts: 'Họ cảm thấy bạn đang dần nhìn thấu sự mập mờ của họ. Họ vừa muốn giữ sự chú ý, vừa sợ phải chịu trách nhiệm.',
      defenseMechanism: 'Họ chọn cách im lặng hoặc phản hồi chậm rãi để kiểm soát nhịp độ, khiến bạn phải là người chủ động sốt ruột trước.',
      hiddenFears: 'Họ sợ bị ràng buộc và sợ bạn nhận ra họ không hoàn hảo như những gì họ thể hiện ban đầu.',
      whatTheyWishYouKnew: 'Đừng ép họ phải đưa ra câu trả lời lúc này, bởi nếu bị ép, câu trả lời chắc chắn sẽ là né tránh.',
    },
    shareableQuote: 'Người không trân trọng thời gian của mình thì mình nhẹ nhàng bước tiếp!',
  };
}

// POST /api/tarot/reading
app.post('/api/tarot/reading', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      readerId = 'madame-realist',
      topic = 'general',
      question = '',
      cards = [],
      spreadType = 'three-cards',
      userContext = '',
      isCustomDeck = false,
    } = req.body;

    const persona = READER_PERSONAS[readerId] || READER_PERSONAS['madame-realist'];

    const cardsSummary = cards
      .map((c: any, index: number) => {
        const position = c.positionName || `Lá ${index + 1}`;
        const orientation = c.isReversed ? 'Ngược (Reversed)' : 'Xuôi (Upright)';
        return `- Vị trí "${position}": ${c.nameVi || c.name} (${orientation}) - Từ khóa: ${c.keywords || ''}. Ý nghĩa gốc: ${c.meaning || ''}`;
      })
      .join('\n');

    const promptText = `
Người hỏi đang yêu cầu trải bài Tarot:
- Chủ đề: ${topic}
- Dạng trải bài: ${spreadType}
- Câu hỏi cụ thể của người hỏi: "${question || 'Muốn xem tổng quan và nhận thông điệp thực tế'}"
${userContext ? `- Ngữ cảnh / hoàn cảnh người hỏi chia sẻ thêm: "${userContext}"` : ''}
${isCustomDeck ? '- Lưu ý: Đây là những lá bài người dùng tự rút ở ngoài (Second Opinion) và nhờ bạn luận giải.' : ''}

Các lá bài đã rút được:
${cardsSummary}

Hãy luận giải trải bài này theo đúng phong cách đặc trưng của bạn (${persona.name}): ${persona.styleDescription}.
Yêu cầu trả về JSON có cấu trúc chính xác sau:
1. "punchline": 1 câu đúc kết cực kỳ sắc sảo, dí dỏm, tóm gọn bản chất vấn đề làm người nghe "tỉnh ngủ" hoặc gật gù thích thú.
2. "generalOverview": Đánh giá tổng quan năng lượng của trải bài (khoảng 2-3 câu sắc bén).
3. "cardsAnalysis": Mảng phân tích chi tiết từng lá bài. Mỗi lá có "cardName", "position", "interpretation".
4. "realityCheck": Góc nhìn sự thật trần trụi (The Brutal Reality / Tỉnh Đòn) - bóc mẽ những điều người hỏi thường cố tình lờ đi hoặc tự huyễn hoặc.
5. "actionAdvice": 3-4 gạch đầu dòng lời khuyên hành động logic.
6. "verdict": Kết luận dứt khoát.
7. "closingMessage": Lời dặn dò cuối cùng mang đậm cá tính của bạn.
8. "mirrorView": Góc nhìn đối phương / người cũ gồm:
   - "partnerThoughts": Họ đang nghĩ gì trong đầu về bạn và mối quan hệ này?
   - "defenseMechanism": Lớp mặt nạ / hàng phòng thủ họ đang dựng lên với bạn
   - "hiddenFears": Nỗi sợ ngầm hoặc sự bất an sâu kín của đối phương
   - "whatTheyWishYouKnew": Điều họ muốn bạn hiểu nhưng không dám nói ra
9. "shareableQuote": 1 câu quote ngắn gọn (12 - 20 từ) cực kỳ deep, bén ngót, trúng tim đen để xuất thẻ ảnh khoe lên Threads/Instagram Story.
`;

    let readingData: any = null;

    // All readers run on Gemini 2.5 Flash Free
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: promptText,
          config: {
            systemInstruction: persona.systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                punchline: { type: Type.STRING },
                generalOverview: { type: Type.STRING },
                cardsAnalysis: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      cardName: { type: Type.STRING },
                      position: { type: Type.STRING },
                      interpretation: { type: Type.STRING },
                    },
                    required: ['cardName', 'position', 'interpretation'],
                  },
                },
                realityCheck: { type: Type.STRING },
                actionAdvice: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                verdict: { type: Type.STRING },
                closingMessage: { type: Type.STRING },
                mirrorView: {
                  type: Type.OBJECT,
                  properties: {
                    partnerThoughts: { type: Type.STRING },
                    defenseMechanism: { type: Type.STRING },
                    hiddenFears: { type: Type.STRING },
                    whatTheyWishYouKnew: { type: Type.STRING },
                  },
                  required: ['partnerThoughts', 'defenseMechanism', 'hiddenFears', 'whatTheyWishYouKnew'],
                },
                shareableQuote: { type: Type.STRING },
              },
              required: [
                'punchline',
                'generalOverview',
                'cardsAnalysis',
                'realityCheck',
                'actionAdvice',
                'verdict',
                'closingMessage',
                'mirrorView',
                'shareableQuote',
              ],
            },
          },
        });

        if (response.text) {
          readingData = JSON.parse(response.text);
        }
      } catch (geminiError) {
        console.warn('Gemini generateContent error, falling back to smart template generator:', geminiError);
      }
    }

    // 3. Fallback smart generator: guaranteed to succeed, personalized to persona and cards
    if (!readingData) {
      readingData = generateFallbackReading(persona, question, cards, topic, userContext);
    }

    res.json({ success: true, data: readingData });
  } catch (error: any) {
    console.error('Error generating tarot reading, returning fallback:', error);
    const persona = READER_PERSONAS[req.body?.readerId] || READER_PERSONAS['madame-realist'];
    const fallback = generateFallbackReading(
      persona,
      req.body?.question || '',
      req.body?.cards || [],
      req.body?.topic || 'general',
      req.body?.userContext || ''
    );
    res.json({
      success: true,
      data: fallback,
    });
  }
});

// POST /api/tarot/chat
app.post('/api/tarot/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      readerId = 'madame-realist',
      message = '',
      chatHistory = [],
      readingContext = null,
    } = req.body;

    const persona = READER_PERSONAS[readerId] || READER_PERSONAS['madame-realist'];

    const promptText = `
Đây là cuộc hội thoại hỏi thêm giữa người dùng và Tarot Reader (${persona.name}).
${readingContext ? `Ngữ cảnh trải bài vừa xem:
- Câu hỏi ban đầu: "${readingContext.question}"
- Các lá bài: ${readingContext.cards ? readingContext.cards.map((c: any) => `${c.nameVi || c.name} (${c.isReversed ? 'ngược' : 'xuôi'})`).join(', ') : 'N/A'}
- Đúc kết trước đó: "${readingContext.punchline || ''}"
` : ''}

Lịch sử trò chuyện gần nhất:
${chatHistory.map((m: any) => `${m.role === 'user' ? 'Người hỏi' : persona.name}: ${m.text}`).join('\n')}

Người hỏi vừa hỏi thêm: "${message}"

Hãy trả lời trực tiếp người hỏi bằng phong cách ${persona.name}: sắc sảo, thực tế, hài hước, thẳng thắn, không giáo điều, chỉ rõ điểm mù tâm lý và đưa ra gợi ý hành động. Độ dài khoảng 2-4 đoạn văn vừa vặn, cuốn hút, nói trúng tim đen.
`;

    let replyText = '';

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: promptText,
          config: {
            systemInstruction: persona.systemPrompt,
          },
        });
        replyText = response.text || '';
      } catch (err) {
        console.warn('Gemini chat error, fallback to witty canned reply:', err);
      }
    }

    if (!replyText) {
      replyText = `Haizz, tôi biết ngay bạn sẽ băn khoăn câu này mà! Để ${persona.name} nói thật một câu nhé: bạn đang cố bấu víu vào một hy vọng mỏng manh để trì hoãn quyết định dứt khoát. Lá bài đã lật rồi, sự thật cũng đã rõ. Việc của bạn lúc này là ngẩng cao đầu, hít một hơi thật sâu và tập trung nâng niu cuộc đời của chính mình!`;
    }

    res.json({ success: true, reply: replyText });
  } catch (error: any) {
    console.error('Error in tarot chat, using safe reply:', error);
    res.json({
      success: true,
      reply: 'Reader đang tập trung suy ngẫm năng lượng tụ bài của bạn. Tóm lại một câu: đừng tiếp tục thỏa hiệp với những điều làm tổn thương lòng tự trọng của mình nữa nhé!',
    });
  }
});

// Daily Tarot Card
app.post('/api/tarot/daily', async (req: Request, res: Response): Promise<void> => {
  try {
    const { card, readerId = 'madame-realist' } = req.body;
    const persona = READER_PERSONAS[readerId] || READER_PERSONAS['madame-realist'];

    const prompt = `
Người dùng rút lá bài ngày hôm nay: ${card?.nameVi || card?.name || 'Tarot Card'} (${card?.isReversed ? 'Ngược' : 'Xuôi'}).
Ý nghĩa gốc: ${card?.meaning || ''}. Từ khóa: ${card?.keywords || ''}.

Hãy viết thông điệp "Thông điệp Thực Tế Hôm Nay" cho người này theo phong cách ${persona.name} (sắc sảo, thực tế, hài hước, tỉnh đòn):
1. Dự báo năng lượng trong ngày (1-2 câu dí dỏm).
2. "Kiếp nạn cần né" (Điều gì có thể làm tụt mood hoặc mắc bẫy hôm nay?).
3. "Lời khuyên vàng" (Hành động chuẩn chỉnh để ngày hôm nay êm đẹp, tiền về túi, lòng an yên).
`;

    let dailyData: any = null;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction: persona.systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                energy: { type: Type.STRING },
                trapToAvoid: { type: Type.STRING },
                goldenAdvice: { type: Type.STRING },
              },
              required: ['energy', 'trapToAvoid', 'goldenAdvice'],
            },
          },
        });

        if (response.text) {
          dailyData = JSON.parse(response.text);
        }
      } catch (err) {
        console.warn('Gemini daily card error, fallback to preset:', err);
      }
    }

    if (!dailyData) {
      dailyData = {
        energy: `Hôm nay năng lượng lá ${card?.nameVi || card?.name || 'Tarot'} nhắc bạn: bớt ôm đồm chuyện bao đồng, ai nhờ vả vô lý thì mạnh dạn nói 'Không'.`,
        trapToAvoid: 'Đừng mua sắm lúc đang stress và đừng rep tin nhắn người yêu cũ lúc đêm muộn!',
        goldenAdvice: 'Làm xong việc của mình rồi về sớm, ăn một bữa thật ngon và ngủ một giấc thật sâu.',
      };
    }

    res.json({ success: true, data: dailyData });
  } catch (error: any) {
    console.error('Error generating daily tarot, using fallback:', error);
    res.json({
      success: true,
      data: {
        energy: 'Năng lượng hôm nay nhắc bạn giữ tâm thế bình thản trước mọi thị phi bên ngoài.',
        trapToAvoid: 'Tránh tranh cãi hơn thua với người không cùng tần số.',
        goldenAdvice: 'Tập trung vào hơi thở, công việc và mục tiêu của chính bạn.',
      },
    });
  }
});

// --- IN-MEMORY DATABASE & BANKING WEBHOOK INTEGRATION ---
interface UserRecord {
  id: string;
  isReaderActive: boolean;
  isVip: boolean;
  credits: number;
  expiredAt: Date | null;
  updatedAt: Date;
}

const userDatabase = new Map<string, UserRecord>();

export const Database = {
  users: {
    findOne: async ({ id }: { id: string }): Promise<UserRecord | null> => {
      return userDatabase.get(id) || null;
    },
    update: async (
      query: { id: string },
      updateData: Partial<UserRecord>
    ): Promise<UserRecord> => {
      const existing = userDatabase.get(query.id) || {
        id: query.id,
        isReaderActive: false,
        isVip: false,
        credits: 1,
        expiredAt: null,
        updatedAt: new Date(),
      };
      const updated: UserRecord = {
        ...existing,
        ...updateData,
        updatedAt: new Date(),
      };
      userDatabase.set(query.id, updated);
      return updated;
    },
  },
};

// GET /api/user/status - Check if user has active reader / VIP privileges
app.get('/api/user/status', async (req: Request, res: Response) => {
  const userId = String(req.query.userId || '').trim();
  if (!userId) {
    res.json({ success: false, message: 'userId is required' });
    return;
  }

  const user = await Database.users.findOne({ id: userId });
  res.json({
    success: true,
    user: user || {
      id: userId,
      isReaderActive: false,
      isVip: false,
      credits: 0,
      expiredAt: null,
    },
  });
});

// API nhận Webhook từ ngân hàng / cổng thanh toán khi có tiền vào (VNPAY / VietQR / MSB)
app.post('/api/webhook/banking', async (req: Request, res: Response): Promise<void> => {
  try {
    const paymentData = req.body || {};
    console.log('[Banking Webhook Received]:', JSON.stringify(paymentData));

    // Nội dung chuyển khoản (content / description) có dạng: "TAROT 12345"
    // Với 12345 là ID của user trong database
    const transferContent = String(paymentData.content || paymentData.description || paymentData.transaction_content || '');
    const amount = parseFloat(
      paymentData.amount || paymentData.transferAmount || paymentData.amount_in || '0'
    );

    // 1. Regex tìm User ID từ nội dung chuyển khoản
    const match = transferContent.match(/TAROT\s*(\d+)/i);
    if (match) {
      const userId = match[1];

      // 2. Kiểm tra số tiền có khớp với giá gói Tarot không
      // Gói VIP 30 ngày (>= 50,000 VNĐ hoặc gói 99,000 VNĐ)
      if (amount >= 50000) {
        // 3. Cập nhật quyền hạn cho User trong Database
        await Database.users.update(
          { id: userId },
          {
            isReaderActive: true,
            isVip: true,
            expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Hạn 30 ngày
          }
        );

        console.log(`Đã kích hoạt quyền VIP Reader thành công cho User ID: ${userId}`);
        res.status(200).json({
          success: true,
          message: 'Activated',
          plan: 'VIP 30 Days',
          userId,
        });
        return;
      } else if (amount >= 10000) {
        // Gói lẻ 1 lượt (10,000 VNĐ)
        const existing = await Database.users.findOne({ id: userId });
        const newCredits = (existing?.credits || 0) + 1;
        await Database.users.update(
          { id: userId },
          {
            isReaderActive: true,
            credits: newCredits,
          }
        );

        console.log(`Đã cộng 1 lượt xem cho User ID: ${userId}`);
        res.status(200).json({
          success: true,
          message: 'Activated',
          plan: '1 Credit',
          userId,
        });
        return;
      }
    }

    res.status(400).json({ success: false, message: 'Invalid content or amount' });
  } catch (err: any) {
    console.error('Error in banking webhook:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- VNPAY PAYMENT GATEWAY INTEGRATION ---
const VNPAY_TMN_CODE = process.env.VNPAY_TMN_CODE || 'MSBTAROT';
const VNPAY_HASH_SECRET = process.env.VNPAY_HASH_SECRET || 'SECRETKEYVNPAY2025';
const VNPAY_URL = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

// POST /api/vnpay/create-payment-url
app.post('/api/vnpay/create-payment-url', (req: Request, res: Response) => {
  try {
    const { amount, userId, orderInfo } = req.body;
    const finalAmount = parseInt(amount || '50000', 10);
    const cleanUserId = String(userId || '12345').trim();
    const memo = `TAROT ${cleanUserId}`;

    // Bank account info for direct QR / VNPAY-QR:
    // MSB - 80000420883 - LUU TU NGUYEN
    const bankCode = 'MSB';
    const bankAccount = '80000420883';
    const accountName = 'LUU TU NGUYEN';

    const vietQrUrl = `https://img.vietqr.io/image/${bankCode}-${bankAccount}-compact2.png?amount=${finalAmount}&addInfo=${encodeURIComponent(
      memo
    )}&accountName=${encodeURIComponent(accountName)}`;

    res.json({
      success: true,
      paymentUrl: `${VNPAY_URL}?vnp_Amount=${finalAmount * 100}&vnp_OrderInfo=${encodeURIComponent(
        memo
      )}&vnp_TmnCode=${VNPAY_TMN_CODE}`,
      qrUrl: vietQrUrl,
      orderCode: memo,
      amount: finalAmount,
      bank: {
        code: bankCode,
        name: 'Ngân hàng Hàng Hải (MSB)',
        accountNumber: bankAccount,
        accountName: accountName,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/vnpay/ipn - VNPAY Instant Payment Notification
app.post('/api/vnpay/ipn', async (req: Request, res: Response) => {
  const vnp_Params = req.query || req.body;
  const orderInfo = String(vnp_Params['vnp_OrderInfo'] || '');
  const amount = parseInt(String(vnp_Params['vnp_Amount'] || '0'), 10) / 100;
  const responseCode = vnp_Params['vnp_ResponseCode'];

  if (responseCode === '00' || responseCode === '0') {
    const match = orderInfo.match(/TAROT\s*(\d+)/i);
    if (match) {
      const userId = match[1];
      if (amount >= 50000) {
        await Database.users.update(
          { id: userId },
          {
            isReaderActive: true,
            isVip: true,
            expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          }
        );
      } else {
        const existing = await Database.users.findOne({ id: userId });
        await Database.users.update(
          { id: userId },
          {
            isReaderActive: true,
            credits: (existing?.credits || 0) + 1,
          }
        );
      }
      res.json({ RspCode: '00', Message: 'Confirm Success' });
      return;
    }
  }

  res.json({ RspCode: '97', Message: 'Fail Checksum or Invalid Transaction' });
});

// --- SEPAY AUTOMATED PAYMENT GATEWAY INTEGRATION (BACKWARD COMPATIBILITY) ---
const SEPAY_API_KEY = process.env.SEPAY_API_KEY || 'spsk_test_tCPwjjqAKZJGqeKKjUMEoUwKU9F6X2YT';
const SEPAY_MERCHANT_CODE = process.env.SEPAY_MERCHANT_CODE || 'SP-TEST-LT492795';
const sepayTransactionsCache: Array<{
  id: string | number;
  content: string;
  amount: number;
  timestamp: number;
}> = [];

// GET /api/sepay/config
app.get('/api/sepay/config', (req: Request, res: Response) => {
  res.json({
    success: true,
    merchantCode: SEPAY_MERCHANT_CODE,
    hasApiKey: !!SEPAY_API_KEY,
  });
});

// POST /api/sepay/webhook - Receive automatic bank transfer notifications from SePay
app.post('/api/sepay/webhook', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    console.log('[SePay Webhook Received]:', JSON.stringify(data));

    if (data) {
      const content = String(data.content || data.description || '');
      const amount = parseFloat(data.transferAmount || data.amount_in || '0');

      sepayTransactionsCache.unshift({
        id: data.id || Date.now(),
        content,
        amount,
        timestamp: Date.now(),
      });

      if (sepayTransactionsCache.length > 100) {
        sepayTransactionsCache.pop();
      }

      // Also trigger the standard banking match for TAROT <userId>
      const match = content.match(/TAROT\s*(\d+)/i);
      if (match) {
        const userId = match[1];
        if (amount >= 50000) {
          await Database.users.update(
            { id: userId },
            {
              isReaderActive: true,
              isVip: true,
              expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            }
          );
        } else if (amount >= 10000) {
          const existing = await Database.users.findOne({ id: userId });
          await Database.users.update(
            { id: userId },
            {
              isReaderActive: true,
              credits: (existing?.credits || 0) + 1,
            }
          );
        }
      }
    }

    res.json({ success: true, message: 'SePay webhook accepted' });
  } catch (err: any) {
    console.error('Error in SePay webhook:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/sepay/check-payment - Query SePay API to verify if payment arrived
app.get('/api/sepay/check-payment', async (req: Request, res: Response): Promise<void> => {
  try {
    const orderCode = String(req.query.orderCode || '').trim();
    const amount = parseFloat(String(req.query.amount || '0'));

    if (!orderCode) {
      res.json({ success: false, paid: false, message: 'orderCode is required' });
      return;
    }

    // 1. Check in-memory webhook cache first
    const cachedMatch = sepayTransactionsCache.find((t) => {
      const normalizedContent = t.content.toLowerCase().replace(/[\s-_]/g, '');
      const normalizedOrderCode = orderCode.toLowerCase().replace(/[\s-_]/g, '');
      const normalizedMerchant = SEPAY_MERCHANT_CODE.toLowerCase().replace(/[\s-_]/g, '');

      const isContentMatch =
        normalizedContent.includes(normalizedOrderCode) ||
        (normalizedContent.includes(normalizedMerchant) && t.amount >= amount * 0.95);

      return isContentMatch && t.amount >= amount * 0.95;
    });

    if (cachedMatch) {
      res.json({
        success: true,
        paid: true,
        source: 'webhook_cache',
        transaction: cachedMatch,
      });
      return;
    }

    // 2. Query SePay REST API (Transactions List)
    if (SEPAY_API_KEY) {
      try {
        const sepayRes = await fetch('https://my.sepay.vn/userapi/transactions/list?limit=20', {
          headers: {
            Authorization: `Bearer ${SEPAY_API_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        if (sepayRes.ok) {
          const sepayData = await sepayRes.json();
          const transactions = sepayData.transactions || [];

          const apiMatch = transactions.find((t: any) => {
            const rawContent = String(t.transaction_content || '');
            const normalizedContent = rawContent.toLowerCase().replace(/[\s-_]/g, '');
            const normalizedOrderCode = orderCode.toLowerCase().replace(/[\s-_]/g, '');
            const normalizedMerchant = SEPAY_MERCHANT_CODE.toLowerCase().replace(/[\s-_]/g, '');
            const transAmount = parseFloat(t.amount_in || '0');

            const isMatch =
              (normalizedContent.includes(normalizedOrderCode) ||
                normalizedContent.includes(normalizedMerchant)) &&
              transAmount >= amount * 0.95;

            return isMatch;
          });

          if (apiMatch) {
            sepayTransactionsCache.unshift({
              id: apiMatch.id,
              content: apiMatch.transaction_content,
              amount: parseFloat(apiMatch.amount_in || '0'),
              timestamp: Date.now(),
            });

            res.json({
              success: true,
              paid: true,
              source: 'sepay_api',
              transaction: apiMatch,
            });
            return;
          }
        }
      } catch (apiErr) {
        console.warn('SePay API poll warning:', apiErr);
      }
    }

    res.json({ success: true, paid: false });
  } catch (err: any) {
    console.error('Error checking SePay payment:', err);
    res.status(500).json({ success: false, paid: false, error: err.message });
  }
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Tarot Realist API',
    hasGemini: !!ai,
    hasClaude: false,
    engine: 'Gemini 2.5 Flash Free',
    bank: {
      name: 'MSB (Hàng Hải)',
      account: '80000420883',
      owner: 'LUU TU NGUYEN',
    },
    hasSepay: !!SEPAY_API_KEY,
  });
});

// Setup Vite or static serving
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Tarot Realist server running at http://0.0.0.0:${port}`);
  });
}

startServer();

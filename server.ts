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

// Reader personas configuration
// - Madame Vy & Thầy Cả: Claude AI (or Gemini fallback with high-intelligence prompt)
// - Bé Z & Chị Thảo: Gemini Flash Free
const READER_PERSONAS: Record<string, {
  name: string;
  tagline: string;
  engine: 'claude' | 'gemini';
  styleDescription: string;
  systemPrompt: string;
}> = {
  'madame-realist': {
    name: 'Madame Vy (Sắc Sảo & Thực Tế)',
    tagline: 'Vả bay ảo tưởng, nói thật mất lòng nhưng tỉnh ngộ',
    engine: 'claude',
    styleDescription: 'Phong cách sắc bén, đi thẳng vào vấn đề, dùng lối nói thấu tình đạt lý, dí dỏm, châm biếm thông minh nhưng cực kỳ chân thành và cho lời khuyên logic hành động rõ ràng.',
    systemPrompt: `Bạn là Madame Vy - một Tarot Reader chuyên nghiệp, sắc sảo, cực kỳ thực tế và hài hước thâm thúy tại Việt Nam.
Phong cách đọc bài của bạn:
- Tinh thần: "Sắc sảo, thực tế, hài hước, tỉnh táo". Không mê tín dị đoan, không nói nước đôi, không thao túng tâm lý.
- Điểm đặc trưng: Bóc trần ảo tưởng một cách duyên dáng ("vả tỉnh người hỏi"), nhìn thẳng vào bản chất vấn đề, vạch ra các điểm mù tâm lý.
- Giọng văn: Ngôn từ đời thường, sắc bén, có chất hài hước dí dỏm của người từng trải, dùng tiếng Việt tự nhiên, có điểm xuyết các thuật ngữ quen thuộc (như red flag, overthinking, tự huyễn hoặc, ghosting, bánh vẽ, KPI, deadline...).
- Mục tiêu: Sau khi nghe bạn phán, người hỏi vừa phải bật cười vì độ "chuẩn không trượt phát nào", vừa tỉnh táo rút ra bài học và có kế hoạch hành động thực tế (action plan).
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
    systemPrompt: `Bạn là Chị Thảo - Tarot Reader mang năng lượng chữa lành, dịu dàng, lắng nghe và đồng cảm sâu sắc.
Hãy trả về JSON theo đúng định dạng được yêu cầu.`,
  },
  'thay-triet-hoc': {
    name: 'Thầy Cả (Triết Lý & Chiến Lược)',
    tagline: 'Chiến lược gia nhân sinh, phân tích ma trận logic',
    engine: 'claude',
    styleDescription: 'Thâm trầm, giàu vốn sống, kết hợp triết học thực hành và tư duy chiến lược logic dứt khoát.',
    systemPrompt: `Bạn là Thầy Cả - một bậc tiền bối uyên bác trong Tarot, coi mỗi trải bài là một ván cờ chiến lược và bài học nhân sinh.
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
9. "threeDayActionPlan": Kế hoạch hành động 3 ngày tới:
   - Ngày 1: { day: 1, title: "Ngày 1: Tỉnh thức & Dọn dẹp tâm trí", task: "Việc cụ thể", advice: "Lời khuyên" }
   - Ngày 2: { day: 2, title: "Ngày 2: Chữa lành & Thiết lập ranh giới", task: "Việc cụ thể", advice: "Lời khuyên" }
   - Ngày 3: { day: 3, title: "Ngày 3: Dứt khoát & Nắm quyền chủ động", task: "Việc cụ thể", advice: "Lời khuyên" }
10. "shareableQuote": 1 câu quote ngắn gọn (12 - 20 từ) cực kỳ deep, bén ngót, trúng tim đen để xuất thẻ ảnh khoe lên Threads/Instagram Story.
`;

    // If Reader is Madame Vy or Thầy Cả and Anthropic key exists -> try Claude
    if (persona.engine === 'claude' && process.env.ANTHROPIC_API_KEY) {
      const claudeData = await callClaudeAPI(persona.systemPrompt, promptText);
      if (claudeData) {
        res.json({ success: true, data: claudeData, engineUsed: 'claude' });
        return;
      }
    }

    if (!ai) {
      // Mock witty response if no API key is configured
      res.json({
        success: true,
        data: {
          punchline: 'Lá bài bảo bạn đừng cố chấp tưới nước cho cái cây nhựa nữa, nó không nở hoa được đâu!',
          generalOverview: `Nhìn vào năng lượng tụ bài này, ${persona.name} thấy bạn đang tự dựng lên một kịch bản quá lý tưởng so với thực tế đang diễn ra. Đã đến lúc gỡ bỏ lớp kính màu hồng để nhìn rõ bàn cờ.`,
          cardsAnalysis: cards.map((c: any, i: number) => ({
            cardName: c.nameVi || c.name,
            position: c.positionName || `Lá ${i + 1}`,
            interpretation: `Với lá ${c.nameVi || c.name} ${c.isReversed ? 'ngược' : 'xuôi'}, nó cho thấy một sự ngập ngừng và thiếu quyết đoán. Bạn biết rõ câu trả lời trong lòng rồi nhưng vẫn đang kiếm tìm một lý do từ bên ngoài để trì hoãn.`,
          })),
          realityCheck: 'Vấn đề không nằm ở việc số phận trớ trêu, mà là bạn sợ cảm giác bước ra khỏi vùng an toàn hoặc sợ phải thừa nhận mình đã chọn sai.',
          actionAdvice: [
            'Dừng ngay việc suy diễn xem người khác nghĩ gì, tập trung vào điều bạn có thể kiểm soát.',
            'Đặt ra deadline cụ thể: nếu trong 7 ngày tới không có chuyển biến tích cực, hãy dứt khoát chuyển hướng.',
            'Bớt lướt mạng xã hội soi xét đối phương hay so sánh bản thân, tập trung ngủ đủ giấc và kiếm tiền.',
          ],
          verdict: 'Cần tỉnh táo và hành động dứt khoát!',
          closingMessage: 'Nghe có vẻ hơi đau lòng nhưng thà đau ngắn còn hơn tự ru ngủ bản thân dài hạn nhé!',
          mirrorView: {
            partnerThoughts: 'Họ cảm thấy bạn đang dần nhìn thấu sự mập mờ của họ. Họ vừa muốn giữ sự chú ý của bạn, vừa sợ phải chịu trách nhiệm.',
            defenseMechanism: 'Họ chọn cách im lặng hoặc phản hồi chậm rãi để kiểm soát nhịp độ, khiến bạn phải là người chủ động sốt ruột trước.',
            hiddenFears: 'Họ sợ bị ràng buộc và sợ bạn nhận ra họ không hoàn hảo hay hào nhoáng như những gì họ thể hiện ban đầu.',
            whatTheyWishYouKnew: 'Đừng ép họ phải đưa ra câu trả lời lúc này, bởi nếu bị ép, câu trả lời chắc chắn sẽ là lời từ chối.',
          },
          threeDayActionPlan: [
            {
              day: 1,
              title: 'Ngày 1: Tắt Thông Báo & Cắt Đứt Suy Diễn',
              task: 'Tắt thông báo của người ấy, tuyệt đối không vào trang cá nhân soi story hay giờ online.',
              advice: 'Mắt không thấy thì tim bớt đau đầu bớt vẽ kịch bản viễn tưởng.',
            },
            {
              day: 2,
              title: 'Ngày 2: Chữa Lành Bằng Bữa Ăn & Bản Thân',
              task: 'Dành 45 phút đi dạo hoặc tự thưởng một món ăn ngon bạn thèm từ lâu.',
              advice: 'Bạn xứng đáng được yêu thương trước tiên từ chính bản thân mình.',
            },
            {
              day: 3,
              title: 'Ngày 3: Dứt Khoát Thiết Lập Ranh Giới',
              task: 'Đưa ra quyết định: Nếu đối phương không có động thái rõ ràng, chính thức đóng lại chương này.',
              advice: 'Một cánh cửa không mở thì đứng đợi trước bậc thềm chỉ làm bạn cảm lạnh.',
            },
          ],
          shareableQuote: 'Người không vì mình thì trời tru đất diệt, người không rep tin nhắn thì mình next!',
        },
      });
      return;
    }

    // Call Gemini 3.8 Flash (Used for Bé Z, Chị Thảo & fallback for Madame Vy/Thầy Cả)
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
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
            threeDayActionPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  task: { type: Type.STRING },
                  advice: { type: Type.STRING },
                },
                required: ['day', 'title', 'task', 'advice'],
              },
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
            'threeDayActionPlan',
            'shareableQuote',
          ],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsedData, engineUsed: 'gemini' });
  } catch (error: any) {
    console.error('Error generating tarot reading:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Không thể tạo bài đọc Tarot vào lúc này.',
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

    if (!ai) {
      res.json({
        success: true,
        reply: `Haizz, tôi biết ngay bạn sẽ hỏi câu này mà! Để tôi nói cho bạn nghe một sự thật: bạn đang cố bấu víu vào một tín hiệu 0.1% để phủ nhận 99.9% sự thờ ơ của đối phương. Lá bài đã lật rồi, sự thật cũng đã phơi bày. Việc của bạn bây giờ là ngẩng cao đầu, tắt thông báo điện thoại và tập trung vào cuộc đời của chính mình!`,
      });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: persona.systemPrompt,
      },
    });

    res.json({ success: true, reply: response.text });
  } catch (error: any) {
    console.error('Error in tarot chat:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Không thể gửi câu hỏi lúc này.',
    });
  }
});

// Daily Tarot Card
app.post('/api/tarot/daily', async (req: Request, res: Response): Promise<void> => {
  try {
    const { card, readerId = 'madame-realist' } = req.body;
    const persona = READER_PERSONAS[readerId] || READER_PERSONAS['madame-realist'];

    const prompt = `
Người dùng rút lá bài ngày hôm nay: ${card.nameVi || card.name} (${card.isReversed ? 'Ngược' : 'Xuôi'}).
Ý nghĩa gốc: ${card.meaning || ''}. Từ khóa: ${card.keywords || ''}.

Hãy viết thông điệp "Thông điệp Thực Tế Hôm Nay" cho người này theo phong cách ${persona.name} (sắc sảo, thực tế, hài hước, tỉnh đòn):
1. Dự báo năng lượng trong ngày (1-2 câu dí dỏm).
2. "Kiếp nạn cần né" (Điều gì có thể làm tụt mood hoặc mắc bẫy hôm nay?).
3. "Lời khuyên vàng" (Hành động chuẩn chỉnh để ngày hôm nay êm đẹp, tiền về túi, lòng an yên).
`;

    if (!ai) {
      res.json({
        success: true,
        data: {
          energy: `Hôm nay năng lượng lá ${card.nameVi || card.name} nhắc bạn: bớt ôm đồm chuyện bao đồng, ai nhờ vả vô lý thì mạnh dạn nói 'Không'.`,
          trapToAvoid: 'Đừng shopping lúc đang stress và đừng rep tin nhắn người yêu cũ sau 11h đêm!',
          goldenAdvice: 'Làm xong việc của mình rồi về sớm, ăn một bữa thật ngon và ngủ một giấc thật sâu.',
        },
      });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
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

    res.json({ success: true, data: JSON.parse(response.text || '{}') });
  } catch (error: any) {
    console.error('Error generating daily tarot:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Tarot Realist API',
    hasGemini: !!ai,
    hasClaude: !!process.env.ANTHROPIC_API_KEY,
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

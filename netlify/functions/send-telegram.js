// netlify/functions/send-telegram.js
exports.handler = async (event) => {
    // Разрешаем только POST-запросы
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { name, phone } = JSON.parse(event.body);
        
        // Берем токен и чат из переменных окружения (которые зададим в Netlify)
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!token || !chatId) {
            return { statusCode: 500, body: 'Telegram config missing' };
        }

        const text = `🍷 *Новая заявка!*\n👤 Имя: ${name}\n📞 Телефон: ${phone}`;

        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'Markdown'
            })
        });

        if (response.ok) {
            return { statusCode: 200, body: JSON.stringify({ success: true }) };
        } else {
            return { statusCode: 500, body: JSON.stringify({ success: false }) };
        }
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
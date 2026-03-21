import { NextResponse } from 'next/server';

export async function POST() {
    const prisma = (await import('@/lib/prisma')).default;
    try {
        await prisma.tool.deleteMany({});
        await prisma.tool.createMany({
            data: [
                { name: 'Wolfram Alpha', desc: 'Ультимативный решатор для матана и физики', category: 'Математика', url: 'https://www.wolframalpha.com' },
                { name: 'ChatGPT', desc: 'Нейронка, которая напишет за тебя любой курсач', category: 'Работа с текстом', url: 'https://chat.openai.com' },
                { name: 'VS Code Web', desc: 'Пиши код прямо в браузере без установки', category: 'Программирование', url: 'https://vscode.dev' },
                { name: 'Desmos', desc: 'Лучший графический калькулятор в мире', category: 'Математика', url: 'https://www.desmos.com/calculator' }
            ]
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
    }
}

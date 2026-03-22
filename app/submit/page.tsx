'use client';

import { useState } from 'react';
import { Send, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

type SubmissionType = 'material' | 'teacher' | 'tool';

export default function SubmitPage() {
    const [type, setType] = useState<SubmissionType>('material');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [checkId, setCheckId] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const data = {
            type,
            title: formData.get('title'),
            author: formData.get('name'),
            group: formData.get('group'),
            content: formData.get('desc'),
            fileUrl: selectedFile ? `[attached: ${selectedFile.name}]` : '',
        };

        try {
            const res = await fetch('/api/submit', {
                method: 'POST',
                // When sending FormData, the 'Content-Type' header is usually set automatically by the browser
                // to 'multipart/form-data' with the correct boundary.
                // Explicitly setting 'Content-Type': 'application/json' would be incorrect here.
                body: formData, // Send FormData directly
            });

            if (res.ok) {
                const result = await res.json();
                setCheckId(result.checkId);
                setIsSuccess(true);
            } else {
                alert('Ошибка при отправке. Попробуй позже.');
            }
        } catch (err) {
            console.error(err);
            alert('Ошибка сети.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="max-w-md mx-auto py-20 text-center space-y-6">
                <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 text-emerald-500 rounded-full mb-4">
                    <CheckCircle2 size={64} />
                </div>
                <h1 className="text-3xl font-black">Заявка отправлена!</h1>
                <div className="p-6 bg-secondary rounded-2xl border border-border space-y-2">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Твой номер заявки:</p>
                    <p className="text-2xl font-black text-primary select-all">{checkId}</p>
                    <p className="text-[10px] text-muted-foreground">Сохрани его, чтобы проверять статус</p>
                </div>
                <p className="text-muted-foreground italic">
                    Твое предложение улетело админу на проверку. Если всё ок, скоро оно появится в системе. Респектуем за вклад!
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => setIsSuccess(false)}
                        className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
                    >
                        Отправить еще что-нибудь
                    </button>
                    <Link href="/check-status" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                        Проверить статус
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <header className="space-y-3">
                <h1 className="text-4xl font-extrabold tracking-tight">Добавить в систему</h1>
                <p className="text-muted-foreground">
                    Хочешь закинуть конспект, оценить препода (которого нет в списке) или предложить крутую решалку? Пиши всё сюда.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-3xl p-6 md:p-8 space-y-6 shadow-xl shadow-black/5">
                <input type="hidden" name="type" value={type} />
                <div className="space-y-4">
                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Что добавляем?</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {(['material', 'teacher', 'tool'] as const).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all flex items-center justify-center text-center ${type === t
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-secondary bg-secondary text-secondary-foreground hover:border-muted-foreground/30'
                                    }`}
                            >
                                {t === 'material' ? 'Конспект' : t === 'teacher' ? 'Препод' : 'Инструмент'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-bold ml-1">Как тебя зовут? (по желанию)</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Анонимный студент"
                            className="w-full bg-secondary border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none text-foreground"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-bold ml-1">Название / Тема</label>
                        <input
                            id="title"
                            name="title"
                            required
                            type="text"
                            placeholder={type === 'material' ? 'Напр: Лекция по ТОЭ №3' : type === 'teacher' ? 'Напр: Петров И.С.' : 'Напр: Solver 3000'}
                            className="w-full bg-secondary border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none text-foreground"
                        />
                    </div>

                    {type === 'material' && (
                        <div className="space-y-2 animate-in slide-in-from-left duration-300">
                            <label htmlFor="group" className="text-sm font-bold ml-1">Группа (например, ТИП 11)</label>
                            <input
                                id="group"
                                name="group"
                                type="text"
                                placeholder="ТИП 11"
                                className="w-full bg-secondary border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none text-foreground"
                            />
                            <p className="text-[10px] text-muted-foreground ml-1">Первая цифра — семестр, вторая — подгруппа. Мы сами определим курс!</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="desc" className="text-sm font-bold ml-1">Описание / Ссылка / Текст отзыва</label>
                        <textarea
                            id="desc"
                            name="desc"
                            required
                            rows={4}
                            placeholder="Опиши детали или вставь ссылку..."
                            className="w-full bg-secondary border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none text-foreground resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold ml-1">Прикрепить файл (если есть)</label>
                        <input
                            type="file"
                            id="file-upload"
                            name="file"
                            className="hidden"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            accept=".pdf,.docx,.png,.jpg,.jpeg"
                        />
                        <label
                            htmlFor="file-upload"
                            className="block border-2 border-dashed border-border rounded-xl p-8 transition-all hover:border-primary/50 text-center cursor-pointer group hover:bg-primary/5 active:scale-[0.99]"
                        >
                            <Upload className={`mx-auto transition-colors mb-2 ${selectedFile ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                            <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors uppercase font-black tracking-widest">
                                {selectedFile ? selectedFile.name : 'Выбери файл'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 underline">
                                {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'PDF, DOCX, PNG до 20MB'}
                            </p>
                            {selectedFile && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setSelectedFile(null);
                                    }}
                                    className="mt-4 text-xs font-bold text-destructive hover:underline"
                                >
                                    Удалить файл
                                </button>
                            )}
                        </label>
                    </div>
                </div>

                <button
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-primary/20"
                >
                    {isSubmitting ? (
                        <div className="w-6 h-6 border-4 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                        <>
                            <Send size={20} />
                            Отправить на проверку
                        </>
                    )}
                </button>

                <p className="text-[10px] text-center text-muted-foreground px-4 leading-normal">
                    Нажимая «Отправить», ты соглашаешься с тем, что админ прочитает твой шедевр и, возможно, даже добавит его на сайт. Не будь редиской, не спамь.
                </p>
            </form>
        </div>
    );
}

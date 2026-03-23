import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getCurrentUser } from '@/lib/auth';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const type = formData.get('type') as 'avatar' | 'banner';

        if (!file || !type) {
            return NextResponse.json({ error: 'Missing file or type' }, { status: 400 });
        }

        // Validate file size (4.5 MB = 4.5 * 1024 * 1024 bytes)
        const MAX_SIZE = 4.5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'File size exceeds 4.5MB limit' }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
        }

        // Create a unique filename
        const ext = file.name.split('.').pop() || 'png';
        const filename = `${type}s/${user.id}_${Date.now()}_${nanoid(6)}.${ext}`;

        // Upload to Vercel Blob
        const blob = await put(filename, file, {
            access: 'public',
        });

        return NextResponse.json({ success: true, url: blob.url });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed', details: error.message }, { status: 500 });
    }
}

'use client';

import React, { useState } from 'react';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button'; // Adjusted path to standard Shadcn location
import { Download, Loader2 } from 'lucide-react';
// import { toast } from 'sonner'; // User requested Sonner but we might need to check if installed or use fallback alert? User said "Selectable/Optional". I'll use alert for now or standard console log if no toaster is setup.
// Let's assume user has standard shadcn toast or just basic alert?
// The user prompt mentioned `toast` from `sonner`. I'll use `alert` for simplicity or a simple console log if not installed.
// Or actually, I should just try to use window.alert or nothing if not critical.
// But `toast.success` is bad if toast isn't imported.
// I'll stick to a simple button state change text for feedback.

interface ShareButtonProps {
    targetRef: React.RefObject<HTMLDivElement | null>;
}

export default function ShareButton({ targetRef }: ShareButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownloadImage = async () => {
        if (!targetRef.current) return;

        setIsLoading(true);
        try {
            // give the hidden element a split second to ensure fonts loaded/layout settled (though usually fine)

            // 1. DOM을 PNG 데이터 URL로 변환
            const dataUrl = await toPng(targetRef.current, {
                cacheBust: true, // CORS 이미지 이슈 방지
                pixelRatio: 2,   // 고해상도 (레티나 디스플레이 대응)
                backgroundColor: '#0f172a' // 다크 테마 배경색 지정
            });

            // 2. 파일 저장 실행
            saveAs(dataUrl, `경제적_자유_리포트_${new Date().toISOString().slice(0, 10)}.png`);
            // toast.success("리포트가 이미지로 저장되었습니다!");
        } catch (err) {
            console.error('이미지 저장 실패:', err);
            // toast.error("이미지 저장 중 오류가 발생했습니다.");
            alert('이미지 저장 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleDownloadImage}
            disabled={isLoading}
            variant="outline"
            className="gap-2"
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Download className="h-4 w-4" />
            )}
            {isLoading ? '생성 중...' : '결과 이미지로 저장'}
        </Button>
    );
}

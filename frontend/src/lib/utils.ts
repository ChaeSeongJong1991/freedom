import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatLargeAmount = (value: number) => {
  if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억`;
  if (value >= 10000) return `${(value / 10000).toFixed(0)}만`;
  if (value >= 0 && value < 10000) return `${value}`; // Handle small numbers
  return value?.toString() || '0';
};

// 숫자를 천 단위 구분자가 포함된 문자열로 변환 (예: 1000000 -> 1,000,000)
export const formatNumber = (value: number | undefined | null) => {
  if (value === undefined || value === null) return '0';
  return new Intl.NumberFormat('ko-KR').format(value);
};

// 쉼표가 포함된 문자열을 숫자로 변환 (예: 1,000,000 -> 1000000)
export const parseNumber = (value: string) => {
  return Number(value.replace(/[^0-9]/g, ''));
};

// 한국인에게 친숙한 '억/만' 단위 가독성 처리
export const formatKoreanUnit = (value: number | undefined | null) => {
  if (value === undefined || value === null) return '0원';
  if (value >= 100000000) {
    const eok = Math.floor(value / 100000000);
    const man = Math.floor((value % 100000000) / 10000);
    return `${eok}억 ${man > 0 ? man + '만' : ''}원`;
  }
  return `${(value / 10000).toLocaleString()}만원`;
};

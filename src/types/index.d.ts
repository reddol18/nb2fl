// src/types/index.d.ts 또는 src/types.ts
export interface SeoInfo {
    title: string;
    description: string;
    thumbnail: string;
}

export interface GenerateRedirectUrlResponse {
    redirectUrl: string;
    uniqueId: string;
}

export interface VisitCountResponse {
    uniqueId: string;
    visitCount: number;
}
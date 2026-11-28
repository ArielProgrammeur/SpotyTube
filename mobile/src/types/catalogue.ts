// c'est mon contrat avec le catalog.json

export type Protocole = 'http' | 'hls' | 'rtsp' | 'webrtc';

export type Media = {
    id: string;
    type: 'video' | 'audio';
    title: string;
    duration: number;
    size_bytes: number;
    bitrate_kbps: number;
    audio_codec: string | null;
    video_codec?: string;
    width?: number;
    height?: number;
    thumbnail?: string | null;
    paths: Partial<Record<Protocole, string>>;
};

export type Catalogue = {
    version: number;
    generated: string;
    Protocols: Record<Protocole, {scheme: string; port: number}>;
    items: Media[];
};
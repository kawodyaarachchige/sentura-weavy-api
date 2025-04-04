export interface User {
    id: number;
    uid: string;
    name: string;
    given_name?: string;
    middle_name?: string;
    family_name?: string;
    nickname?: string;
    email?: string;
    phone_number?: string;
    avatar_url?: string;
    picture?: {
        id: number;
        name: string;
        media_type: string;
        width: number;
        height: number;
        size: number;
        thumbnail_url: string;
        raw: string;
    };
    directory?: {
        id: number;
        name: string;
    };
    presence?: string;
    comment?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    is_trashed: boolean;
}

export interface UserFormData {
    uid: string;
    name: string;
    email?: string;
    directory?: string;
    given_name?: string;
    middle_name?: string;
    family_name?: string;
    nickname?: string;
    phone_number?: string;
    comment?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
}
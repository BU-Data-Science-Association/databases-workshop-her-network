import { getSupabaseClient } from "../lib/supabase";

export type Artist = {
  artist_id: number;
  full_name: string;
  nationality: string | null;
  style: string | null;
};

export type Work = {
  work_id: number;
  name: string;
  artist_id: number;
  museum_id: number;
};

export type Museum = {
  museum_id: number;
  name: string;
  city: string | null;
  country: string | null;
};

export const fetchArtists = async (): Promise<Artist[]> => {
  const client = getSupabaseClient();
  if (!client) {
    return [];
  }

  const { data, error } = await client
    .from("artist")
    .select("artist_id, full_name, nationality, style")
    .order("artist_id", { ascending: true })
    .limit(200);

  if (error) {
    return [];
  }

  return data ?? [];
};

export const fetchWorks = async (): Promise<Work[]> => {
  const client = getSupabaseClient();
  if (!client) {
    return [];
  }

  const { data, error } = await client
    .from("work")
    .select("work_id, name, artist_id, museum_id")
    .order("work_id", { ascending: true })
    .limit(200);

  if (error) {
    return [];
  }

  return data ?? [];
};

export const fetchMuseums = async (): Promise<Museum[]> => {
  const client = getSupabaseClient();
  if (!client) {
    return [];
  }

  const { data, error } = await client
    .from("museum")
    .select("museum_id, name, city, country")
    .order("museum_id", { ascending: true })
    .limit(200);

  if (error) {
    return [];
  }

  return data ?? [];
};

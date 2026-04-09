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
  image_url: string | null;
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
    .select("work_id, name, artist_id")
    .order("work_id", { ascending: true })
    .limit(200);

  if (error) {
    return [];
  }

  const rows =
    (data as { work_id: number; name: string; artist_id: number }[] | null) ??
    [];

  const imageMap = await fetchWorkImageMap();

  return rows.map((row) => ({
    work_id: row.work_id,
    name: row.name,
    artist_id: row.artist_id,
    image_url: imageMap.get(row.work_id) ?? null,
  }));
};

const fetchWorkImageMap = async (): Promise<Map<number, string>> => {
  const client = getSupabaseClient();
  if (!client) {
    return new Map();
  }

  const { data, error } = await client
    .from("image_link")
    .select("work_id, thumbnail_small_url, thumbnail_large_url, url")
    .limit(200);

  if (error) {
    return new Map();
  }

  const imageRows =
    (data as
      | {
          work_id: number;
          thumbnail_small_url: string | null;
          thumbnail_large_url: string | null;
          url: string | null;
        }[]
      | null) ?? [];

  const imageMap = new Map<number, string>();
  imageRows.forEach((row) => {
    const preferredImage =
      row.thumbnail_small_url ?? row.thumbnail_large_url ?? row.url;
    if (preferredImage) {
      imageMap.set(row.work_id, preferredImage);
    }
  });

  return imageMap;
};

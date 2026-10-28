// Vercel serverless function: GET /api/count
const USERNAME = "fishesb";
const COLLECTION_ID = "LOG:3"; // Jungle Wood

export default async function handler(req, res) {
  try {
    const key = process.env.HYPIXEL_KEY;
    if (!key) throw new Error("Server is missing HYPIXEL_KEY");

    const pRes = await fetch("https://playerdb.co/api/player/minecraft/" + USERNAME);
    const pData = await pRes.json();
    if (!pData.success) throw new Error("Could not find player " + USERNAME);
    const uuid = pData.data.player.raw_id;

    const hRes = await fetch("https://api.hypixel.net/v2/skyblock/profiles?uuid=" + uuid, {
      headers: { "API-Key": key },
    });
    const data = await hRes.json();
    if (!data.success) throw new Error(data.cause || "Hypixel API error");
    if (!data.profiles || !data.profiles.length) throw new Error("No SkyBlock profiles found");

    const profile = data.profiles.find((p) => p.selected) || data.profiles[0];
    const member = profile.members[uuid];
    const value = member && member.collection ? member.collection[COLLECTION_ID] : undefined;
    if (value === undefined) throw new Error("No collection data (is the Collections API setting on in-game?)");

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate");
    res.status(200).json({ count: value });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

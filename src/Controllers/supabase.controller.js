import supabase from "../Connection/supabase.js"


export const UploadUrl = async (req, res) => {
  try {
    const { fileName, bucket } = req.body;
    if (!fileName || !bucket)
      return res.status(400).json({ error: "fileName and bucket required" });

    // 1) Generate Signed Upload URL (PUT)
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(fileName, 60 * 60); // valid for 1 hour

    if (error)
      return res.status(500).json({ message: error.message, success: false });

    // 2) Generate public URL using the path returned
    const path = data.path;

    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    const publicUrl = publicData.publicUrl;

    return res.status(200).json({
      uploadUrl: data.signedUrl,
      path,
      publicUrl,
      success: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", success: false });
  }
};


export const DownloadUrl = async (req, res) => {
  try {
    const { path, bucket, expires = 60 } = req.body
    if (!path || !bucket) return res.status(400).json({ message: "path and bucket required",success:false })

    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expires)
    if (error) return res.status(500).json({ error: error.message })

    return res.status(200).json({ downloadUrl: data?.signedUrl, success:true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Server error", success:false })
  }
}
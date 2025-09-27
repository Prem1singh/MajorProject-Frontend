import React, { useState, useEffect } from "react";
import api from "../../../../utils/axiosInstance";

export default function UploadMaterial() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null); // File object
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/teachers/subjects"); // teacher subjects
        setSubjects(res.data.subjects);
        if (res.data.subjects.length > 0) setSelectedSubject(res.data.subjects[0]._id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSubjects();
  }, []);

  const handleUpload = async () => {
    if (!title || !file || !selectedSubject) return alert("Fill all fields");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("subject", selectedSubject);
      formData.append("file", file); // Multer expects field name "file"

      await api.post("/study/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Material uploaded successfully");
      setTitle("");
      setDescription("");
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-2">Upload Study Material</h2>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <select
          className="border rounded p-2"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
      </div>

      <input
        type="text"
        placeholder="Title"
        className="border rounded p-2 w-full"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Description"
        className="border rounded p-2 w-full"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="file"
        className="border rounded p-2 w-full"
        onChange={(e) => setFile(e.target.files[0])} // Save first file selected
      />

      <button
        className={`px-4 py-2 rounded bg-blue-600 text-white ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={handleUpload}
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}

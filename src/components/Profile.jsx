import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import api from "../utils/axiosInstance";
import { updateProfile } from "../redux/slice/userSlice";

export default function ProfileTab() {
  const user = useSelector((state) => state.user.data);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profilePicture: null,
    profilePicturePreview: "",
  });
  const [batchName, setBatchName] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (user && !editMode) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        profilePicture: null,
        profilePicturePreview: user.profileUrl || "",
      });
    }

    const fetchBatch = async () => {
      if (user?.batch) {
        try {
          const res = await api.get(`/batches/${user.batch}`);
          setBatchName(res.data.name || "-");
        } catch (err) {
          console.error("Error fetching batch:", err.response?.data || err.message);
          setBatchName("-");
        }
      }
    };
    fetchBatch();
  }, [user, editMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData((prev) => ({
      ...prev,
      profilePicture: file,
      profilePicturePreview: URL.createObjectURL(file),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      if (formData.profilePicture) data.append("profilePicture", formData.profilePicture);

      const res = await api.put("/users/profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedUser = res.data.user || res.data;
      dispatch(updateProfile(updatedUser));
      setMsg("Profile updated successfully!");
      setEditMode(false);
    } catch (err) {
      console.error("Error updating profile:", err.response?.data || err.message);
      setMsg("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto w-full">
      <h2 className="text-xl sm:text-2xl font-bold mb-6">My Profile</h2>
      {msg && <p className="mb-4 text-green-600">{msg}</p>}

      <form
        className="space-y-4 w-full bg-white shadow-md rounded-xl p-4 sm:p-6"
        onSubmit={handleSubmit}
      >
        {/* Profile Picture */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          <img
            src={formData.profilePicturePreview || "https://via.placeholder.com/100"}
            alt="profile"
            className="w-24 h-24 rounded-full border object-cover"
          />
          {editMode && (
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="border p-1 rounded w-full sm:w-auto"
            />
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block font-semibold">Name:</label>
          {editMode ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              required
            />
          ) : (
            <p>{formData.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block font-semibold">Email:</label>
          {editMode ? (
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              required
            />
          ) : (
            <p>{formData.email}</p>
          )}
        </div>

        {/* Roll No / Employee Id */}
        <div>
          <label className="block font-semibold">
            {user.role === "Student" ? "Roll No:" : "Employee ID:"}
          </label>
          <p>{user.role === "Student" ? user.rollNo || "-" : user.employeeId || "-"}</p>
        </div>

        {/* Batch & Semester */}
        {user.role === "Student" && (
          <>
            <div>
              <label className="block font-semibold">Batch:</label>
              <p>{batchName || "-"}</p>
            </div>
            <div>
              <label className="block font-semibold">Semester:</label>
              <p>{user.semester || "-"}</p>
            </div>
          </>
        )}

        {/* Role */}
        <div>
          <label className="block font-semibold">Role:</label>
          <p className="capitalize">{user.role || "student"}</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 mt-4">
          {!editMode && (
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 w-full sm:w-auto"
            >
              Edit Profile
            </button>
          )}

          {editMode && (
            <>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full sm:w-auto"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 w-full sm:w-auto"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

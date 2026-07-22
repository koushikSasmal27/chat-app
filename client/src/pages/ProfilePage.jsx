import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);

  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [name, setName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");

  const [loading, setLoading] = useState(false);

  // Create preview URL for selected image
  useEffect(() => {
    if (!selectedImage) {
      setPreviewImage(null);
      return;
    }

    const imageUrl = URL.createObjectURL(selectedImage);

    setPreviewImage(imageUrl);

    // Cleanup object URL
    return () => {
      URL.revokeObjectURL(imageUrl);
    };
  }, [selectedImage]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    // Validate file size - maximum 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setSelectedImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // If no new image is selected
      if (!selectedImage) {
        await updateProfile({
          fullName: name,
          bio,
        });

        navigate("/");
        return;
      }

      // Convert image to Base64
      const reader = new FileReader();

      reader.readAsDataURL(selectedImage);

      reader.onload = async () => {
        await updateProfile({
          profilePic: reader.result,
          fullName: name,
          bio,
        });

        navigate("/");
      };
    } catch (error) {
      console.error("Profile update error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center">
      <div className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg">

        {/* Profile Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 p-10 flex-1"
        >
          <h3 className="text-lg">Profile Details</h3>

          {/* Profile Image Upload */}
          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              type="file"
              id="avatar"
              accept="image/png, image/jpeg, image/jpg"
              hidden
              onChange={handleImageChange}
            />

            {/* Small Image */}
            <img
              src={
                previewImage ||
                authUser?.profilePic ||
                assets.avatar_icon
              }
              alt="Profile Preview"
              className="w-12 h-12 rounded-full object-cover object-[center_25%]"
            />

            <span>Upload profile image</span>
          </label>

          {/* Name Input */}
          <input
            type="text"
            required
            value={name}
            placeholder="Your name"
            onChange={(e) => setName(e.target.value)}
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          {/* Bio Input */}
          <textarea
            required
            rows={4}
            value={bio}
            placeholder="Write profile bio"
            onChange={(e) => setBio(e.target.value)}
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          {/* Save Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
        {/* Large Profile Image */}
        <img
          src={
            previewImage ||
            authUser?.profilePic ||
            assets.logo_icon
          }
          alt="Profile"
          className="w-44 h-44 object-cover object-[center_25%] mx-10 max-sm:mt-10 rounded-full"
        />
      </div>
    </div>
  );
};

export default ProfilePage;
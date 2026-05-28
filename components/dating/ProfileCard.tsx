"use client";

import { useState } from "react";
import { Heart, MapPin, GraduationCap, Briefcase, Users } from "lucide-react";
import { toast } from "@/components/ui/Toaster";

interface Profile {
  id: string;
  displayName: string;
  age: number;
  gender: string;
  city: string;
  state: string;
  bio?: string | null;
  photos: string[];
  height?: number | null;
  religion?: string | null;
  education?: string | null;
  occupation?: string | null;
  goals: string;
  hasChildren: boolean;
  liked?: boolean;
}

interface ProfileCardProps {
  profile: Profile;
  onLikeToggle?: (profileId: string, liked: boolean, matched: boolean) => void;
}

const goalLabel: Record<string, string> = {
  FRIENDSHIP: "Friendship",
  CASUAL_DATING: "Casual Dating",
  SERIOUS_RELATIONSHIP: "Serious Relationship",
  MARRIAGE: "Marriage",
};

export default function ProfileCard({ profile, onLikeToggle }: ProfileCardProps) {
  const [liked, setLiked] = useState(profile.liked ?? false);
  const [loading, setLoading] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);

  const handleLike = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dating/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetProfileId: profile.id }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Failed", "error"); return; }
      setLiked(data.liked);
      if (data.matched) toast(`It's a match with ${profile.displayName}! 🎉`, "success");
      onLikeToggle?.(profile.id, data.liked, data.matched);
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  const photo = profile.photos[photoIdx];

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow group">
      <div className="relative h-72 bg-gradient-to-br from-rose-100 to-pink-100">
        {photo ? (
          <img src={photo} alt={profile.displayName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-rose-200 flex items-center justify-center">
              <span className="text-4xl font-bold text-rose-400">{profile.displayName[0]}</span>
            </div>
          </div>
        )}

        {profile.photos.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {profile.photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setPhotoIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === photoIdx ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        )}

        <button
          onClick={handleLike}
          disabled={loading}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
            liked
              ? "bg-rose-500 text-white"
              : "bg-white/90 text-slate-400 hover:text-rose-500"
          }`}
        >
          <Heart className={`w-5 h-5 ${liked ? "fill-white" : ""}`} />
        </button>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="text-white font-bold text-lg leading-tight">
            {profile.displayName}, {profile.age}
          </h3>
          <p className="text-white/80 text-sm flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {profile.city}, {profile.state}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {profile.bio && (
          <p className="text-slate-600 text-sm line-clamp-2">{profile.bio}</p>
        )}

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 text-xs bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full font-medium">
            <Heart className="w-3 h-3" /> {goalLabel[profile.goals] ?? profile.goals}
          </span>
          {profile.education && (
            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
              <GraduationCap className="w-3 h-3" /> {profile.education}
            </span>
          )}
          {profile.occupation && (
            <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">
              <Briefcase className="w-3 h-3" /> {profile.occupation}
            </span>
          )}
          {profile.hasChildren && (
            <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium">
              <Users className="w-3 h-3" /> Has children
            </span>
          )}
          {profile.religion && (
            <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-medium">
              {profile.religion}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

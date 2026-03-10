"use client";

import VolunteerForm from "@/app/components/VolunteerForm";

export default function VolunteersPage() {
  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6 text-orange-700">
        Volunteers Management
      </h1>

      <VolunteerForm />

    </div>
  );
}
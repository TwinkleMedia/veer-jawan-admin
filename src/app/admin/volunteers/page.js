"use client";

import MembershipForm from "@/app/components/MembershipForm";

export default function VolunteersPage() {
  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6 text-orange-700">
       Membership Management
      </h1>

      <MembershipForm />

    </div>
  );
}
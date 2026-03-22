import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/auth/supabase-server";

export type UserRole = "admin" | "basic";
export type UserStatus = "active" | "disabled";
export type UserPlan = "basic";

export type AccessProfile = {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  plan: UserPlan;
  createdAt: string;
  updatedAt: string;
};

export type AccessContext = {
  user: User;
  profile: AccessProfile;
};

type UserProfileRow = {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  plan: UserPlan;
  created_at: string;
  updated_at: string;
};

function mapProfile(row: UserProfileRow): AccessProfile {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    status: row.status,
    plan: row.plan,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function createDefaultProfileInput(user: Pick<User, "id" | "email">) {
  return {
    id: user.id,
    email: user.email ?? "",
    role: "basic" as const,
    status: "active" as const,
    plan: "basic" as const
  };
}

async function ensureAccessProfile(user: User) {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id,email,role,status,plan,created_at,updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const nextEmail = user.email ?? "";

  if (!data) {
    const adminClient = getSupabaseAdminClient();
    const insertPayload = createDefaultProfileInput(user);
    const { data: insertedProfile, error: insertError } = await adminClient
      .from("user_profiles")
      .insert(insertPayload)
      .select("id,email,role,status,plan,created_at,updated_at")
      .single();

    if (insertError) {
      throw insertError;
    }

    return mapProfile(insertedProfile as UserProfileRow);
  }

  if (data.email !== nextEmail) {
    const adminClient = getSupabaseAdminClient();
    const { data: updatedProfile, error: updateError } = await adminClient
      .from("user_profiles")
      .update({ email: nextEmail })
      .eq("id", user.id)
      .select("id,email,role,status,plan,created_at,updated_at")
      .single();

    if (updateError) {
      throw updateError;
    }

    return mapProfile(updatedProfile as UserProfileRow);
  }

  return mapProfile(data as UserProfileRow);
}

export const getAccessContext = cache(async (): Promise<AccessContext | null> => {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await ensureAccessProfile(user);
  return {
    user,
    profile
  };
});

export async function requireAuthenticatedUser() {
  const accessContext = await getAccessContext();

  if (!accessContext) {
    redirect("/login");
  }

  return accessContext;
}

export async function requireActiveUser() {
  const accessContext = await requireAuthenticatedUser();

  if (accessContext.profile.status === "disabled") {
    redirect("/access-disabled");
  }

  return accessContext;
}

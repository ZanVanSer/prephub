import type { User } from "@supabase/supabase-js";
import {
  createDefaultProfileInput,
  type UserPlan,
  type UserRole,
  type UserStatus
} from "@/lib/auth/access";
import { getSupabaseAdminClient } from "@/lib/auth/supabase-server";
import { assertAdminUserUpdateAllowed } from "@/modules/admin/lib/contracts";
import type {
  AdminUserRecord,
  AdminUserUpdateInput
} from "@/modules/admin/types";

function assertServerOnly() {
  if (typeof window !== "undefined") {
    throw new Error("Admin user data helpers are server-only.");
  }
}

type UserProfileRow = {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  plan: UserPlan;
  created_at: string;
  updated_at: string;
};

type AdminAuthUser = Pick<User, "id" | "email" | "created_at" | "last_sign_in_at">;

type PreparedAdminUsers = {
  users: AdminUserRecord[];
  missingProfiles: ReturnType<typeof createDefaultProfileInput>[];
  emailUpdates: Array<{ id: string; email: string }>;
};

function buildProfileMap(profileRows: UserProfileRow[]) {
  return new Map(profileRows.map((row) => [row.id, row]));
}

function mapAdminUser(
  authUser: AdminAuthUser,
  profileRow: UserProfileRow,
  currentUserId: string
): AdminUserRecord {
  return {
    id: authUser.id,
    email: authUser.email ?? profileRow.email,
    role: profileRow.role,
    status: profileRow.status,
    plan: profileRow.plan,
    createdAt: profileRow.created_at,
    updatedAt: profileRow.updated_at,
    lastSignInAt: authUser.last_sign_in_at ?? null,
    isCurrentUser: authUser.id === currentUserId
  };
}

export function prepareAdminUsers(
  authUsers: AdminAuthUser[],
  profileRows: UserProfileRow[],
  currentUserId: string
): PreparedAdminUsers {
  const profileMap = buildProfileMap(profileRows);
  const now = new Date().toISOString();
  const missingProfiles: ReturnType<typeof createDefaultProfileInput>[] = [];
  const emailUpdates: Array<{ id: string; email: string }> = [];

  const users = authUsers.map((authUser) => {
    const authEmail = authUser.email ?? "";
    const existingProfile = profileMap.get(authUser.id);

    if (!existingProfile) {
      missingProfiles.push(
        createDefaultProfileInput({
          id: authUser.id,
          email: authEmail
        })
      );

      return mapAdminUser(
        authUser,
        {
          id: authUser.id,
          email: authEmail,
          role: "basic",
          status: "active",
          plan: "basic",
          created_at: authUser.created_at ?? now,
          updated_at: authUser.created_at ?? now
        },
        currentUserId
      );
    }

    if (existingProfile.email !== authEmail) {
      emailUpdates.push({ id: authUser.id, email: authEmail });
    }

    return mapAdminUser(
      authUser,
      {
        ...existingProfile,
        email: authEmail
      },
      currentUserId
    );
  });

  users.sort((left, right) => left.email.localeCompare(right.email));

  return {
    users,
    missingProfiles,
    emailUpdates
  };
}

async function fetchProfileRows(userIds: string[]) {
  assertServerOnly();

  if (userIds.length === 0) {
    return [] as UserProfileRow[];
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id,email,role,status,plan,created_at,updated_at")
    .in("id", userIds);

  if (error) {
    throw error;
  }

  return (data ?? []) as UserProfileRow[];
}

async function ensureUserProfiles(
  authUsers: AdminAuthUser[],
  currentUserId: string
) {
  const userIds = authUsers.map((user) => user.id);
  const profileRows = await fetchProfileRows(userIds);
  const preparedUsers = prepareAdminUsers(authUsers, profileRows, currentUserId);
  const supabase = getSupabaseAdminClient();

  if (preparedUsers.missingProfiles.length > 0) {
    const { error } = await supabase.from("user_profiles").insert(preparedUsers.missingProfiles);

    if (error) {
      throw error;
    }
  }

  if (preparedUsers.emailUpdates.length > 0) {
    await Promise.all(
      preparedUsers.emailUpdates.map(async (item) => {
        const { error } = await supabase
          .from("user_profiles")
          .update({ email: item.email })
          .eq("id", item.id);

        if (error) {
          throw error;
        }
      })
    );
  }

  if (preparedUsers.missingProfiles.length > 0 || preparedUsers.emailUpdates.length > 0) {
    const refreshedProfiles = await fetchProfileRows(userIds);
    return prepareAdminUsers(authUsers, refreshedProfiles, currentUserId).users;
  }

  return preparedUsers.users;
}

export async function listAdminUsers(currentUserId: string) {
  assertServerOnly();

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000
  });

  if (error) {
    throw error;
  }

  return ensureUserProfiles(data.users as AdminAuthUser[], currentUserId);
}

async function getAuthUserById(userId: string) {
  assertServerOnly();

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.getUserById(userId);

  if (error || !data.user) {
    throw error ?? new Error("User not found.");
  }

  return data.user;
}

async function getOrCreateUserProfile(userId: string, authUser: AdminAuthUser) {
  assertServerOnly();

  const rows = await fetchProfileRows([userId]);

  if (rows[0]) {
    return rows[0];
  }

  const supabase = getSupabaseAdminClient();
  const payload = createDefaultProfileInput({
    id: authUser.id,
    email: authUser.email ?? ""
  });

  const { data, error } = await supabase
    .from("user_profiles")
    .insert(payload)
    .select("id,email,role,status,plan,created_at,updated_at")
    .single();

  if (error) {
    throw error;
  }

  return data as UserProfileRow;
}

export async function updateAdminUser(params: {
  actorUserId: string;
  targetUserId: string;
  input: AdminUserUpdateInput;
}) {
  assertServerOnly();

  const { actorUserId, targetUserId, input } = params;
  const authUser = (await getAuthUserById(targetUserId)) as AdminAuthUser;
  const currentProfile = await getOrCreateUserProfile(targetUserId, authUser);

  assertAdminUserUpdateAllowed({
    actorUserId,
    targetUserId,
    currentProfile: {
      role: currentProfile.role,
      status: currentProfile.status
    },
    nextProfile: input
  });

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .update({
      email: authUser.email ?? currentProfile.email,
      role: input.role,
      status: input.status,
      plan: input.plan
    })
    .eq("id", targetUserId)
    .select("id,email,role,status,plan,created_at,updated_at")
    .single();

  if (error) {
    throw error;
  }

  return mapAdminUser(authUser, data as UserProfileRow, actorUserId);
}

import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ApprovalStatus,
  PatientTreatmentPlanView,
  TherapyTask,
  UserApprovalInfo,
  UserProfile,
} from "../backend";
import { useActor } from "./useActor";

// ── User Profile ──────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ── Approval ──────────────────────────────────────────────────────────────────

export function useIsCallerApproved() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isCallerApproved"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerApproved();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useRequestApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.requestApproval();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isCallerApproved"] });
    },
  });
}

export function useListApprovals() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserApprovalInfo[]>({
    queryKey: ["listApprovals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listApprovals();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      user,
      status,
    }: { user: Principal; status: ApprovalStatus }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setApproval(user, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listApprovals"] });
    },
  });
}

// ── Role ──────────────────────────────────────────────────────────────────────

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ["callerUserRole"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ── Speech Exercises ──────────────────────────────────────────────────────────

export function useFetchSpeechExercises() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ["speechExercises"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.fetchSpeechExercises();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export function useSubmitSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      task,
      score,
    }: { task: TherapyTask; score: number }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitSession(task, BigInt(score));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerSessions"] });
      queryClient.invalidateQueries({ queryKey: ["callerPlan"] });
    },
  });
}

export function useFetchCallerSessions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint[]>({
    queryKey: ["callerSessions"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.fetchCallerSessions();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useFetchCallerPlan() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PatientTreatmentPlanView | null>({
    queryKey: ["callerPlan"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.fetchCallerPlan();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching,
  });
}

// ── Therapist ─────────────────────────────────────────────────────────────────

export function useListPatients() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ["listPatients"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPatients();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useFetchTreatmentPlan(patientId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PatientTreatmentPlanView | null>({
    queryKey: ["treatmentPlan", patientId?.toString()],
    queryFn: async () => {
      if (!actor || !patientId) return null;
      try {
        return await actor.fetchTreatmentPlan(patientId);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!patientId,
  });
}

export function useFetchSessionScores(patientId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint[]>({
    queryKey: ["sessionScores", patientId?.toString()],
    queryFn: async () => {
      if (!actor || !patientId) return [];
      try {
        return await actor.fetchSessionScores(patientId);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!patientId,
  });
}

export function useAddTherapistFeedback() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      patientId,
      feedbackText,
    }: { patientId: Principal; feedbackText: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addTherapistFeedback(patientId, feedbackText);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["treatmentPlan", variables.patientId.toString()],
      });
    },
  });
}

export function useUpdateRecoveryTrend() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      patientId,
      trend,
    }: { patientId: Principal; trend: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateRecoveryTrend(patientId, trend);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["treatmentPlan", variables.patientId.toString()],
      });
    },
  });
}

export function useGetUserProfile(user: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      try {
        return await actor.getUserProfile(user);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!user,
  });
}

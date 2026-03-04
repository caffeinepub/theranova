import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Clock, Loader2, ShieldAlert } from "lucide-react";
import type React from "react";
import { useIsCallerApproved, useRequestApproval } from "../hooks/useQueries";

interface ApprovalGateProps {
  children: React.ReactNode;
}

export default function ApprovalGate({ children }: ApprovalGateProps) {
  const { data: isApproved, isLoading } = useIsCallerApproved();
  const {
    mutate: requestApproval,
    isPending,
    isSuccess,
  } = useRequestApproval();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isApproved) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-64 p-6">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-2">
            <ShieldAlert className="w-8 h-8 text-warning" />
          </div>
          <CardTitle className="font-display">Access Pending</CardTitle>
          <CardDescription>
            Your account needs to be approved by a therapist before you can
            access this module.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="flex items-center justify-center gap-2 text-success font-medium">
              <CheckCircle className="w-5 h-5" />
              Approval request sent! Please wait for a therapist to review.
            </div>
          ) : (
            <Button
              onClick={() => requestApproval()}
              disabled={isPending}
              className="w-full h-11 gradient-primary text-white border-0"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />{" "}
                  Requesting...
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 mr-2" /> Request Access
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

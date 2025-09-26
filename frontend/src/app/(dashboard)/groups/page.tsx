"use client";

import React from "react";
import { GroupsFeature } from "@/components/groups/GroupsFeature";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { GroupsErrorFallback } from "@/components/common/ErrorFallbacks/GroupsErrorFallback";

const GroupsPage: React.FC = () => {
  return (
    <ErrorBoundary fallback={GroupsErrorFallback}>
      <GroupsFeature />
    </ErrorBoundary>
  );
};

export default GroupsPage;
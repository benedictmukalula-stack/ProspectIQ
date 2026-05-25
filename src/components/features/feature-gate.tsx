import React from 'react';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  children,
  fallback = null,
}) => {
  // For now, render the children (the feature is considered "enabled").
  // Replace with actual feature‑flag logic later.
  return <>{children}</>;
};

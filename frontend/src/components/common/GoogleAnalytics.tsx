"use client";

import { GoogleAnalytics as NextGoogleAnalytics } from "@next/third-parties/google";

type GoogleAnalyticsProps = {
  measurementId?: string;
};

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const gaId = measurementId || process.env['NEXT_PUBLIC_GA_MEASUREMENT_ID'];
  if (!gaId) return null;
  return <NextGoogleAnalytics gaId={gaId} />;
}



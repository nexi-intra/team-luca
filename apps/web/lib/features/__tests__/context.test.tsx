import React from "react";
import { renderHook, act } from "@testing-library/react";
import { FeatureRingProvider, useFeatureRingContext } from "@monorepo/features";

describe("FeatureRingContext", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <FeatureRingProvider defaultRing={4}>{children}</FeatureRingProvider>
  );

  beforeEach(() => {
    localStorage.clear();
  });

  it("provides default ring value", () => {
    const { result } = renderHook(() => useFeatureRingContext(), { wrapper });

    expect(result.current.userRing).toBe(4);
  });

  it("allows changing user ring", () => {
    const { result } = renderHook(() => useFeatureRingContext(), { wrapper });

    act(() => {
      result.current.setUserRing(2);
    });

    expect(result.current.userRing).toBe(2);
  });

  it("persists ring to localStorage", () => {
    const { result } = renderHook(() => useFeatureRingContext(), { wrapper });

    act(() => {
      result.current.setUserRing(3);
    });

    expect(localStorage.getItem("feature-ring")).toBe("3");
  });

  it("loads ring from localStorage on mount", () => {
    localStorage.setItem("feature-ring", "2");

    const { result } = renderHook(() => useFeatureRingContext(), { wrapper });

    expect(result.current.userRing).toBe(2);
  });

  it("correctly checks ring access", () => {
    const { result } = renderHook(() => useFeatureRingContext(), { wrapper });

    act(() => {
      result.current.setUserRing(3);
    });

    expect(result.current.hasAccessToRing(4)).toBe(true);
    expect(result.current.hasAccessToRing(3)).toBe(true);
    expect(result.current.hasAccessToRing(2)).toBe(false);
    expect(result.current.hasAccessToRing(1)).toBe(false);
  });

  it("correctly checks feature access", () => {
    // Import the actual features from constants
    const { FEATURES } = require("@/lib/features/constants");

    const { result } = renderHook(() => useFeatureRingContext(), { wrapper });

    act(() => {
      result.current.setUserRing(3);
    });

    // User with ring 3 should have access to features with ring 3 and 4
    // Using actual features from constants
    expect(result.current.hasAccessToFeature("dark-mode")).toBe(true); // ring 4
    expect(result.current.hasAccessToFeature("ai-suggestions")).toBe(true); // ring 3
    expect(result.current.hasAccessToFeature("advanced-analytics")).toBe(false); // ring 2
    expect(result.current.hasAccessToFeature("experimental-chat")).toBe(false); // ring 1
  });

  it("throws error when used outside provider", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();

    expect(() => {
      renderHook(() => useFeatureRingContext());
    }).toThrow(
      "useFeatureRingContext must be used within a FeatureRingProvider",
    );

    consoleError.mockRestore();
  });
});

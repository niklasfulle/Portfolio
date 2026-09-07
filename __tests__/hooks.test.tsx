import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

var mockUseInView;
var mockUseActiveSectionContext;

jest.mock("react-intersection-observer", () => {
  mockUseInView = jest.fn();
  return { useInView: mockUseInView };
});
jest.mock("@/context/active-section-context", () => {
  mockUseActiveSectionContext = jest.fn();
  return { useActiveSectionContext: mockUseActiveSectionContext };
});

import { useSectionInView } from "@/lib/hooks";

function HookConsumer() {
  const { ref } = useSectionInView("Projects", 0.5);
  return <div data-testid="section" ref={ref} />;
}

function DefaultThresholdConsumer() {
  const { ref } = useSectionInView("Home");
  return <div data-testid="default-section" ref={ref} />;
}

function mount(element: React.ReactElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(element));
  return { container, root };
}

function rerender(root: Root, element: React.ReactElement) {
  act(() => root.render(element));
}

function unmount({ container, root }: { container: HTMLDivElement; root: Root }) {
  act(() => root.unmount());
  container.remove();
}

describe("useSectionInView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseActiveSectionContext.mockReturnValue({
      setActiveSection: jest.fn(),
      timeOfLastClick: 0,
    });
    mockUseInView.mockImplementation(({ threshold }) => ({
      ref: jest.fn(),
      inView: threshold === 0.5,
    }));
  });

  it("passes the threshold and updates the active section after the click guard", () => {
    const nowSpy = jest.spyOn(Date, "now").mockReturnValue(5000);
    const setActiveSection = jest.fn();
    mockUseActiveSectionContext.mockReturnValue({
      setActiveSection,
      timeOfLastClick: 0,
    });
    const mounted = mount(<HookConsumer />);

    expect(mockUseInView).toHaveBeenCalledWith({ threshold: 0.5 });
    expect(setActiveSection).toHaveBeenCalledWith("Projects");

    nowSpy.mockRestore();
    unmount(mounted);
  });

  it("does not update while the recent-click guard is active", () => {
    const setActiveSection = jest.fn();
    mockUseActiveSectionContext.mockReturnValue({
      setActiveSection,
      timeOfLastClick: 4500,
    });
    const nowSpy = jest.spyOn(Date, "now").mockReturnValue(5000);
    const mounted = mount(<HookConsumer />);

    expect(setActiveSection).not.toHaveBeenCalled();
    nowSpy.mockRestore();
    unmount(mounted);
  });

  it("uses the documented default threshold and skips updates when not visible", () => {
    const setActiveSection = jest.fn();
    mockUseActiveSectionContext.mockReturnValue({
      setActiveSection,
      timeOfLastClick: 0,
    });
    mockUseInView.mockReturnValue({ ref: jest.fn(), inView: false });
    const mounted = mount(<DefaultThresholdConsumer />);

    expect(mockUseInView).toHaveBeenCalledWith({ threshold: 0.75 });
    expect(setActiveSection).not.toHaveBeenCalled();
    unmount(mounted);
  });
});

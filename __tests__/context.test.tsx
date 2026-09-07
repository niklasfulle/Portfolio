import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import ActiveSectionContextProvider, {
  useActiveSectionContext,
} from "@/context/active-section-context";

function ContextConsumer() {
  const {
    activeSection,
    setActiveSection,
    timeOfLastClick,
    setTimeOfLastClick,
  } = useActiveSectionContext();

  return (
    <div>
      <output data-testid="active">{activeSection}</output>
      <output data-testid="last-click">{timeOfLastClick}</output>
      <button onClick={() => setActiveSection("Contact")}>set section</button>
      <button onClick={() => setTimeOfLastClick(1234)}>set click</button>
    </div>
  );
}

function mount(element: React.ReactElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(element));
  return { container, root };
}

function unmount({ container, root }: { container: HTMLDivElement; root: Root }) {
  act(() => root.unmount());
  container.remove();
}

describe("ActiveSectionContextProvider", () => {
  beforeAll(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
      true;
  });

  it("provides initial state and updates both values", () => {
    const mounted = mount(
      <ActiveSectionContextProvider>
        <ContextConsumer />
      </ActiveSectionContextProvider>
    );

    expect(mounted.container.querySelector("[data-testid=active]")?.textContent).toBe(
      "Home"
    );
    expect(
      mounted.container.querySelector("[data-testid=last-click]")?.textContent
    ).toBe("0");

    const buttons = mounted.container.querySelectorAll("button");
    act(() => {
      buttons[0].dispatchEvent(new MouseEvent("click", { bubbles: true }));
      buttons[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(mounted.container.querySelector("[data-testid=active]")?.textContent).toBe(
      "Contact"
    );
    expect(
      mounted.container.querySelector("[data-testid=last-click]")?.textContent
    ).toBe("1234");
    unmount(mounted);
  });

  it("throws when the hook is used outside its provider", () => {
    function InvalidConsumer() {
      useActiveSectionContext();
      return null;
    }

    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => mount(<InvalidConsumer />)).toThrow(
      "useActiveSectionContext must be used within an ActiveSectionContextProvider"
    );
    errorSpy.mockRestore();
  });
});

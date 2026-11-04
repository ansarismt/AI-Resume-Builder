import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { emptyResume } from "@/components/resume/types";
import { TemplateSelectionPage } from "./TemplateSelectionPage";

describe("TemplateSelectionPage", () => {
  it("supports template selection as a keyboard-navigable radio group", () => {
    const onSelectTemplate = vi.fn();
    const radios = () => screen.getAllByRole("radio");

    render(
      <TemplateSelectionPage
        data={emptyResume}
        selectedTemplate="template1"
        selectedColor="#1f3a5f"
        onSelectTemplate={onSelectTemplate}
        onSelectColor={vi.fn()}
        onBack={vi.fn()}
        onContinue={vi.fn()}
      />,
    );

    expect(screen.getByRole("radiogroup", { name: "Resume templates" })).toBeInTheDocument();
    expect(radios()).toHaveLength(20);
    radios()[0].focus();
    fireEvent.keyDown(radios()[0], { key: "ArrowRight" });

    expect(radios()[1]).toHaveFocus();
    expect(onSelectTemplate).toHaveBeenCalledWith("template2");
  });
});

import Home from "../page"
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

//@ts-ignore
global.fetch = jest.fn(() => Promise.resolve({
  json: () => Promise.resolve({ data: [] })
}));

describe("Home", () => {
  it("renders inputs", () => {
    render(<Home />);
    // check if all components are rendered
    expect(screen.getByText("Data inicio:")).toBeInTheDocument();
  });
});
import Home from "../page"
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";

//@ts-ignore
global.fetch = jest.fn(() => Promise.resolve({
  json: () => Promise.resolve({ data: [] })
}));

describe("Home", () => {
  it("renders inputs", async () => {
    const { getByText } = render(<Home />);
    // check if all components are rendered
    const listNode = await waitFor(() => getByText('Data inicio:'));

    expect(listNode).not.toBeNull();
  });
});

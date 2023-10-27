import { analysisService } from '../analysis'

describe("analysis service", () => {
  it("find tops and bottoms", () => {
    // check if all components are rendered

    const result = (analysisService as any).detectar_topos_e_fundos([], 2)
    expect(result).not.toBeNull();
  });
});
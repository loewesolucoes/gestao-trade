import { analysisService } from '../analysis'
import './intraday.mock';

//@ts-ignore
const intraday = global.intraday;

describe("analysis service", () => {

  it("find tops and bottoms", () => {
    // check if all components are rendered

    const result = (analysisService as any).detectar_topos_e_fundos(intraday, 2)
    expect(result).not.toBeNull();
    expect(result.topos).toHaveLength(2);
    expect(result.fundos).toHaveLength(2);
  });
});